<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'];
$schedule = $data['schedule'];
$teacher = $data['teacher'];

$query = "INSERT INTO batches (name, schedule, teacher) VALUES (?, ?, ?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("sss", $name, $schedule, $teacher);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error adding batch']);
}

mysqli_close($conn);
?>