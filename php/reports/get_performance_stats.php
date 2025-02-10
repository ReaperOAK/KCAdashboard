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

// Get performance data including grades and assignments
$query = "SELECT 
    u.name as student_name,
    g.grade,
    a.title as assignment_name,
    g.created_at as submission_date
    FROM users u
    JOIN grades g ON u.id = g.student_id
    JOIN assignments a ON g.assignment_id = a.id
    WHERE u.id IN (SELECT student_id FROM batch_students WHERE batch_id = ?)
    ORDER BY g.created_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $batch_id);
$stmt->execute();
$result = $stmt->get_result();

$performance_data = [];
while ($row = $result->fetch_assoc()) {
    $performance_data[] = $row;
}

echo json_encode($performance_data);
$stmt->close();
$conn->close();
