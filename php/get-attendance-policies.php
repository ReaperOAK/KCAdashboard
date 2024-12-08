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

// Fetch attendance policies
$sql = "SELECT threshold, reminder FROM attendance_policies LIMIT 1";
$result = $conn->query($sql);

if (!$result) {
    error_log("Database query failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Error fetching attendance policies']);
    exit;
}

$policies = $result->fetch_assoc();

// Return the policies as JSON
echo json_encode($policies);

// Close the connection
$conn->close();
?>