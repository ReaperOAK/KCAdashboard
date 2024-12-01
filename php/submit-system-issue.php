<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$data = json_decode(file_get_contents('php://input'), true);

$issue = $data['issue'];

$query = "INSERT INTO system_issues (issue) VALUES (?)";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $issue);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error submitting system issue']);
}

mysqli_close($conn);
?>