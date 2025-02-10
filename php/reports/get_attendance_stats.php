<?php
require_once('../config.php');
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$batch_id = isset($_GET['batch_id']) ? intval($_GET['batch_id']) : 0;

if (!$batch_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Batch ID is required']);
    exit;
}

// Get attendance statistics
$query = "SELECT 
    u.name as student_name,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
    ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) / COUNT(*)) * 100, 2) as attendance_percentage
    FROM users u
    JOIN attendance a ON u.id = a.student_id
    JOIN classes c ON a.class_id = c.id
    WHERE c.batch_id = ?
    GROUP BY u.id, u.name";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $batch_id);
$stmt->execute();
$result = $stmt->get_result();

$attendance_data = [];
while ($row = $result->fetch_assoc()) {
    $attendance_data[] = $row;
}

echo json_encode($attendance_data);
$stmt->close();
$conn->close();
