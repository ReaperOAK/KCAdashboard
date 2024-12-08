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

// Get the issue ID from the request body
$data = json_decode(file_get_contents("php://input"), true);
$issueId = $data['issueId'];

// Delete the system issue
$sql = "DELETE FROM system_issues WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $issueId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'System issue resolved successfully']);
} else {
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Error resolving system issue']);
}

// Close the statement and the connection
$stmt->close();
$conn->close();
?>