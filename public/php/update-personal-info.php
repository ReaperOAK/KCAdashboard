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
$name = $data->name;
$profilePicture = $data->profilePicture; // Assuming this is a URL or base64 string

// If profilePicture is a file upload, handle it accordingly
if (isset($_FILES['profilePicture'])) {
    $targetDir = "uploads/";
    $targetFile = $targetDir . basename($_FILES["profilePicture"]["name"]);
    if (move_uploaded_file($_FILES["profilePicture"]["tmp_name"], $targetFile)) {
        $profilePicture = $targetFile;
    } else {
        error_log("Error uploading profile picture");
        echo json_encode(['success' => false, 'message' => 'Error uploading profile picture']);
        exit;
    }
}

// SQL query to update personal information using prepared statements
$sql = "UPDATE users SET name = ?, profile_picture = ? WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $name, $profilePicture, $email);

if ($stmt->execute()) {
    // Return success response
    echo json_encode(['success' => true, 'message' => 'Personal information updated successfully']);
} else {
    // Log error and return failure response for database query failure
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Error updating personal information: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>