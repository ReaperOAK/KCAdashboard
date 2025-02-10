<?php
require_once '../../config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    exit('Unauthorized');
}

$user_id = $_SESSION['user_id'];

$response = [];

// Get student's attendance stats
$query = "SELECT COUNT(*) as total, 
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
          FROM attendance 
          WHERE student_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$attendance = $result->fetch_assoc();
$response['attendance'] = $attendance;

// Get upcoming classes
$query = "SELECT c.* FROM classes c
          JOIN batches b ON c.batch_id = b.id
          JOIN student_batches sb ON b.id = sb.batch_id
          WHERE sb.student_id = ? AND c.time > NOW()
          ORDER BY c.time ASC LIMIT 5";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$response['upcoming_classes'] = $result->fetch_all(MYSQLI_ASSOC);

// Get recent performance
$query = "SELECT * FROM performance 
          WHERE student_id = ? 
          ORDER BY id DESC LIMIT 5";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$response['recent_performance'] = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($response);
