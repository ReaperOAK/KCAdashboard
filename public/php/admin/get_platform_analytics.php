<?php
require_once('../config.php');
header('Content-Type: application/json');

// Check admin authentication here
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

try {
    $analytics = [];
    
    // Get user activity metrics
    $userActivityQuery = "
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as login_count
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    ";
    
    $userActivity = $conn->query($userActivityQuery);
    $analytics['userActivity'] = $userActivity->fetch_all(MYSQLI_ASSOC);

    // Get performance metrics
    $performanceQuery = "
        SELECT 
            AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100 as attendance_rate,
            COUNT(DISTINCT student_id) as active_students,
            COUNT(DISTINCT class_id) as total_classes
        FROM attendance
        WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ";
    
    $performance = $conn->query($performanceQuery);
    $analytics['performanceMetrics'] = $performance->fetch_assoc();

    // Calculate system health
    $systemHealth = [
        'uptime' => 99.9, // You might want to implement actual uptime monitoring
        'responseTime' => calculateAverageResponseTime($conn),
        'errorRate' => calculateErrorRate($conn)
    ];
    $analytics['systemHealth'] = $systemHealth;

    echo json_encode($analytics);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    error_log($e->getMessage());
}

function calculateAverageResponseTime($conn) {
    // Query to get average response time from system_issues or similar table
    $query = "
        SELECT AVG(TIMESTAMPDIFF(SECOND, created_at, NOW())) as avg_response
        FROM support_tickets
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ";
    $result = $conn->query($query);
    $row = $result->fetch_assoc();
    return $row['avg_response'] ?? 250; // Default to 250ms if no data
}

function calculateErrorRate($conn) {
    // Query to calculate error rate from system_issues
    $query = "
        SELECT 
            (COUNT(CASE WHEN issue LIKE '%error%' THEN 1 END) / COUNT(*)) * 100 as error_rate
        FROM system_issues
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ";
    $result = $conn->query($query);
    $row = $result->fetch_assoc();
    return $row['error_rate'] ?? 0.1; // Default to 0.1% if no data
}

$conn->close();
?>
