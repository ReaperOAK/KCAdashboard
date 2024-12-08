<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

// Start the session
session_start();

// Check if the user is logged in and is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get the user ID from the request body
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'];

// Delete the user
$query = "DELETE FROM users WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $userId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error deleting user']);
}

mysqli_close($conn);
?>