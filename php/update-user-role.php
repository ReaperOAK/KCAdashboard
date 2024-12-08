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

// Get the user ID and new role from the request body
$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['userId'];
$role = $data['role'];

// Validate the role
$validRoles = ['student', 'teacher', 'admin'];
if (!in_array($role, $validRoles)) {
    echo json_encode(['success' => false, 'message' => 'Invalid role']);
    exit;
}

// Update the user's role
$query = "UPDATE users SET role = ? WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("si", $role, $userId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'User role updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating user role or no changes made']);
}

// Close the statement and the connection
$stmt->close();
$conn->close();
?>