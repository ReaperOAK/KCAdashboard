<?php
require_once '../../config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    exit('Unauthorized');
}

$response = [];

// Get user statistics
$query = "SELECT role, COUNT(*) as count, 
          SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active
          FROM users 
          GROUP BY role";
$result = $conn->query($query);
$response['user_stats'] = $result->fetch_all(MYSQLI_ASSOC);

// Get system issues
$query = "SELECT * FROM system_issues 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          ORDER BY created_at DESC";
$result = $conn->query($query);
$response['system_issues'] = $result->fetch_all(MYSQLI_ASSOC);

// Get attendance overview
$query = "SELECT 
          DATE(a.date) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
          FROM attendance a
          WHERE a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          GROUP BY DATE(a.date)
          ORDER BY date DESC";
$result = $conn->query($query);
$response['attendance_overview'] = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($response);
