<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$data = json_decode(file_get_contents('php://input'), true);
$batchId = $data['id'];

$query = "DELETE FROM batches WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $batchId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error deleting batch']);
}

mysqli_close($conn);
?>