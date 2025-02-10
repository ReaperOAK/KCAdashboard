<?php
require_once('../config.php');
header('Content-Type: application/json');

// Verify admin session/authentication here
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$reportType = $data['type'] ?? '';
$startDate = $data['dateRange']['start'] ?? '';
$endDate = $data['dateRange']['end'] ?? '';

// Validate dates
if (!$startDate || !$endDate) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid date range']);
    exit;
}

function getAttendanceReport($conn, $startDate, $endDate) {
    $query = "SELECT 
        b.name as batch_name,
        u.name as student_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        COUNT(*) as total_classes,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) / COUNT(*)) * 100, 2) as attendance_percentage
    FROM attendance a
    JOIN users u ON a.student_id = u.id
    JOIN classes c ON a.class_id = c.id
    JOIN batches b ON c.batch_id = b.id
    WHERE a.date BETWEEN ? AND ?
    GROUP BY b.id, u.id
    ORDER BY b.name, attendance_percentage DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getPerformanceReport($conn, $startDate, $endDate) {
    $query = "SELECT 
        u.name as student_name,
        COUNT(g.id) as assignments_completed,
        AVG(CASE 
            WHEN g.grade = 'A+' THEN 100
            WHEN g.grade = 'A' THEN 90
            WHEN g.grade = 'B' THEN 80
            WHEN g.grade = 'C' THEN 70
            WHEN g.grade = 'D' THEN 60
            ELSE 50
        END) as average_score
    FROM grades g
    JOIN users u ON g.student_id = u.id
    JOIN assignments a ON g.assignment_id = a.id
    WHERE g.created_at BETWEEN ? AND ?
    GROUP BY u.id
    ORDER BY average_score DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getEngagementReport($conn, $startDate, $endDate) {
    $query = "SELECT 
        u.name,
        COUNT(DISTINCT a.id) as attended_classes,
        COUNT(DISTINCT g.id) as submitted_assignments,
        COUNT(DISTINCT st.id) as support_tickets
    FROM users u
    LEFT JOIN attendance a ON u.id = a.student_id AND a.status = 'present' AND a.date BETWEEN ? AND ?
    LEFT JOIN grades g ON u.id = g.student_id AND g.created_at BETWEEN ? AND ?
    LEFT JOIN support_tickets st ON u.id = st.user_id AND st.created_at BETWEEN ? AND ?
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY attended_classes DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssssss", $startDate, $endDate, $startDate, $endDate, $startDate, $endDate);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getSystemReport($conn, $startDate, $endDate) {
    $query = "SELECT 
        DATE(created_at) as date,
        COUNT(*) as issue_count,
        GROUP_CONCAT(issue SEPARATOR '|') as issues
    FROM system_issues
    WHERE created_at BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ss", $startDate, $endDate);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

try {
    $reportData = [];
    
    switch ($reportType) {
        case 'attendance':
            $reportData = getAttendanceReport($conn, $startDate, $endDate);
            break;
        case 'performance':
            $reportData = getPerformanceReport($conn, $startDate, $endDate);
            break;
        case 'engagement':
            $reportData = getEngagementReport($conn, $startDate, $endDate);
            break;
        case 'system':
            $reportData = getSystemReport($conn, $startDate, $endDate);
            break;
        default:
            throw new Exception('Invalid report type');
    }
    
    echo json_encode([
        'success' => true,
        'data' => $reportData
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}

$conn->close();
