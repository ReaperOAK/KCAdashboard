<?php
// Include the database configuration file
include 'config.php';

// Start the session
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch personal information
$sql = "SELECT name, email, profile_picture FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$personalInfo = $result->fetch_assoc();

// Fetch notification settings
$sql = "SELECT missed_class, assignment_due FROM notifications WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$notifications = $result->fetch_assoc();

// Return the data as JSON
echo json_encode([
    'success' => true,
    'personalInfo' => $personalInfo,
    'notifications' => $notifications
]);

// Close the statement and the connection
$stmt->close();
$conn->close();
?>