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

// Fetch personal information and notification settings
$sql = "SELECT name, email, profile_picture, missed_class_notifications, assignment_due_notifications FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log("Prepare failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Database query failed']);
    exit;
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
if (!$result) {
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Database query failed']);
    exit;
}
$userData = $result->fetch_assoc();

// Prepare the response data
$personalInfo = [
    'name' => $userData['name'],
    'email' => $userData['email'],
    'profile_picture' => $userData['profile_picture']
];

$notifications = [
    'missedClass' => (bool)$userData['missed_class_notifications'],
    'assignmentDue' => (bool)$userData['assignment_due_notifications']
];

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