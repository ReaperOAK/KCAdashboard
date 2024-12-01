<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$data = json_decode(file_get_contents('php://input'), true);

$userId = $data['userId'];
$role = $data['role'];

$query = "UPDATE users SET role = ? WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("si", $role, $userId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating user role']);
}

mysqli_close($conn);
?>