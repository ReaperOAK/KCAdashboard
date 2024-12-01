<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$data = json_decode(file_get_contents('php://input'), true);

$assignmentId = $data['assignmentId'];
$studentId = $data['studentId'];
$grade = $data['grade'];
$comment = $data['comment'];

$query = "INSERT INTO grades (assignment_id, student_id, grade, comment) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("iiss", $assignmentId, $studentId, $grade, $comment);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error submitting grades']);
}

mysqli_close($conn);
?>