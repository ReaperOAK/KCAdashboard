<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    error_log("Invalid JSON input");
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$email = $data->email;
$currentPassword = $data->currentPassword;
$newPassword = password_hash($data->newPassword, PASSWORD_DEFAULT);

// Check if the email exists and get the current password hash
$sql = "SELECT password FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user) {
    // Verify the current password
    if (password_verify($currentPassword, $user['password'])) {
        // Update the password
        $sql = "UPDATE users SET password = ? WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $newPassword, $email);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
        } else {
            error_log("Database query failed: " . $stmt->error);
            echo json_encode(['success' => false, 'message' => 'Error updating password: ' . $stmt->error]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Email not found']);
}

$stmt->close();
$conn->close();
?>