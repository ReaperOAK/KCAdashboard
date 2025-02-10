<?php
require_once '../config.php';
header('Content-Type: application/json');

$batch_id = isset($_GET['batch_id']) ? $_GET['batch_id'] : null;

if (!$batch_id) {
    echo json_encode(['error' => 'Batch ID is required']);
    exit;
}

$query = "SELECT u.id, u.name 
          FROM users u 
          INNER JOIN batches_students bs ON u.id = bs.student_id 
          WHERE bs.batch_id = ? AND u.role = 'student'";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $batch_id);
$stmt->execute();
$result = $stmt->get_result();

$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode(['students' => $students]);
$stmt->close();
$conn->close();
?>
