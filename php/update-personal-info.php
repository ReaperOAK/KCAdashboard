<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    error_log("Invalid JSON input");
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$email = $data->email;
$name = $data->name;
$profilePicture = $data->profilePicture; // Assuming this is a URL or base64 string

// SQL query to update personal information using prepared statements
$sql = "UPDATE users SET name = ?, profile_picture = ? WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $name, $profilePicture, $email);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Personal information updated successfully']);
} else {
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Error updating personal information: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>