<?php
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Verify JWT token
$user = authenticateToken();

// Check if user is admin
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get total students
    $stmt = $conn->query("SELECT COUNT(*) FROM users WHERE role = 'student' AND status = 'active'");
    $totalStudents = $stmt->fetchColumn();

    // Get total teachers
    $stmt = $conn->query("SELECT COUNT(*) FROM users WHERE role = 'teacher' AND status = 'active'");
    $totalTeachers = $stmt->fetchColumn();

    // Get active classes
    $stmt = $conn->query("SELECT COUNT(*) FROM batches WHERE status = 'active'");
    $activeClasses = $stmt->fetchColumn();

    // Calculate monthly revenue (example)
    $stmt = $conn->query("SELECT COALESCE(SUM(entry_fee), 0) FROM tournament_registrations 
                         WHERE MONTH(registration_date) = MONTH(CURRENT_DATE) 
                         AND YEAR(registration_date) = YEAR(CURRENT_DATE)
                         AND payment_status = 'completed'");
    $monthlyRevenue = $stmt->fetchColumn();

    // Get total batches
    $stmt = $conn->query("SELECT COUNT(*) FROM batches");
    $totalBatches = $stmt->fetchColumn();

    // Calculate attendance rate
    $sql = "SELECT 
            (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as attendance_rate
            FROM attendance
            WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)";
    $stmt = $conn->query($sql);
    $attendanceRate = round($stmt->fetchColumn(), 2);

    echo json_encode([
        'status' => 'success',
        'stats' => [
            'totalStudents' => $totalStudents,
            'totalTeachers' => $totalTeachers,
            'activeClasses' => $activeClasses,
            'monthlyRevenue' => $monthlyRevenue,
            'totalBatches' => $totalBatches,
            'attendanceRate' => $attendanceRate
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch dashboard stats: ' . $e->getMessage()
    ]);
}
?>
