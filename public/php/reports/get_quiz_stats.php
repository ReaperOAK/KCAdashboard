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

// Get quiz statistics
$query = "SELECT 
    u.name as student_name,
    q.title as quiz_title,
    qr.score,
    qr.correct_answers,
    qr.total_questions,
    qr.completed_at
    FROM users u
    JOIN quiz_results qr ON u.id = qr.user_id
    JOIN quizzes q ON qr.quiz_id = q.id
    WHERE u.id IN (SELECT student_id FROM batch_students WHERE batch_id = ?)
    ORDER BY qr.completed_at DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $batch_id);
$stmt->execute();
$result = $stmt->get_result();

$quiz_data = [];
while ($row = $result->fetch_assoc()) {
    $quiz_data[] = $row;
}

echo json_encode($quiz_data);
$stmt->close();
$conn->close();
