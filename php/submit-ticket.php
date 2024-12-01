<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

session_start();
$userId = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);

$subject = $data['subject'];
$description = $data['description'];

$query = "INSERT INTO support_tickets (user_id, subject, description, status) VALUES (?, ?, ?, 'Pending')";
$stmt = $conn->prepare($query);
$stmt->bind_param("iss", $userId, $subject, $description);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error submitting ticket']);
}

mysqli_close($conn);
?>