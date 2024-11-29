<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

$email = $data->email;
$missedClass = $data->missedClass ? 1 : 0;
$assignmentDue = $data->assignmentDue ? 1 : 0;

$sql = "UPDATE users SET missed_class_notifications = '$missedClass', assignment_due_notifications = '$assignmentDue' WHERE email = '$email'";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Notification settings updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating notification settings: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>