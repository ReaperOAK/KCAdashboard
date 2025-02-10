<?php
require_once '../config.php';
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['student_id']) || !isset($data['status']) || !isset($data['date']) || !isset($data['batch_id'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$student_id = $data['student_id'];
$status = $data['status'];
$date = $data['date'];
$batch_id = $data['batch_id'];

// First check if attendance already exists
$checkQuery = "SELECT id FROM attendance 
              WHERE student_id = ? AND date = ? AND batch_id = ?";

$stmt = $conn->prepare($checkQuery);
$stmt->bind_param("isi", $student_id, $date, $batch_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Update existing attendance
    $row = $result->fetch_assoc();
    $updateQuery = "UPDATE attendance 
                   SET status = ? 
                   WHERE id = ?";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param("si", $status, $row['id']);
} else {
    // Insert new attendance
    $insertQuery = "INSERT INTO attendance 
                   (student_id, status, date, batch_id) 
                   VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($insertQuery);
    $stmt->bind_param("issi", $student_id, $status, $date, $batch_id);
}

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => 'Failed to mark attendance']);
}

$stmt->close();
$conn->close();
?>
