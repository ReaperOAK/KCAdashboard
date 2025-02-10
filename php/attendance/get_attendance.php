<?php
require_once '../config.php';
header('Content-Type: application/json');

$batch_id = isset($_GET['batch_id']) ? $_GET['batch_id'] : null;
$date = isset($_GET['date']) ? $_GET['date'] : null;

if (!$batch_id || !$date) {
    echo json_encode(['error' => 'Batch ID and date are required']);
    exit;
}

$query = "SELECT u.id, u.name, COALESCE(a.status, 'Not marked') as attendance
          FROM users u 
          INNER JOIN batches_students bs ON u.id = bs.student_id 
          LEFT JOIN attendance a ON u.id = a.student_id 
            AND a.date = ? AND a.batch_id = ?
          WHERE bs.batch_id = ? AND u.role = 'student'";

$stmt = $conn->prepare($query);
$stmt->bind_param("sii", $date, $batch_id, $batch_id);
$stmt->execute();
$result = $stmt->get_result();

$attendance = [];
while ($row = $result->fetch_assoc()) {
    $attendance[] = $row;
}

echo json_encode(['attendance' => $attendance]);
$stmt->close();
$conn->close();
?>
