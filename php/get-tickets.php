<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$userId = $_COOKIE['user_id'];

$query = "SELECT id, subject, description, status FROM support_tickets WHERE user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Error fetching tickets']);
    exit;
}

$tickets = [];
while ($row = $result->fetch_assoc()) {
    $tickets[] = $row;
}

echo json_encode($tickets);

mysqli_close($conn);
?>