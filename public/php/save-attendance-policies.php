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

// Get the policies from the request body
$data = json_decode(file_get_contents("php://input"), true);
$threshold = $data['threshold'];
$reminder = $data['reminder'];

// Update attendance policies
$sql = "UPDATE attendance_policies SET threshold = ?, reminder = ? WHERE id = 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $threshold, $reminder);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Policies saved successfully']);
} else {
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Error saving policies']);
}

// Close the statement and the connection
$stmt->close();
$conn->close();
?>