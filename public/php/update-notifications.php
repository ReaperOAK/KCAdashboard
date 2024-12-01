<?php
include 'config.php';

// Decode JSON input
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    // Log error and return failure response for invalid input
    error_log("Invalid JSON input");
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$email = $data->email;
$missedClass = $data->missedClass ? 1 : 0;
$assignmentDue = $data->assignmentDue ? 1 : 0;

// SQL query to update notification settings using prepared statements
$sql = "UPDATE users SET missed_class_notifications = ?, assignment_due_notifications = ? WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iis", $missedClass, $assignmentDue, $email);

if ($stmt->execute()) {
    // Return success response
    echo json_encode(['success' => true, 'message' => 'Notification settings updated successfully']);
} else {
    // Log error and return failure response for database query failure
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Error updating notification settings: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>