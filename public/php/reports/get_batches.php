<?php
require_once('../config.php');
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$teacher_id = $_SESSION['user_id'];

$query = "SELECT id, name FROM batches WHERE teacher = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();

$batches = [];
while ($row = $result->fetch_assoc()) {
    $batches[] = $row;
}

echo json_encode($batches);
$stmt->close();
$conn->close();
