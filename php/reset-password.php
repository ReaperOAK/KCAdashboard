<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);

    // Validate the token
    $query = "SELECT * FROM password_resets WHERE token = ? AND expires > ?";
    $stmt = $conn->prepare($query);
    $currentTime = time();
    $stmt->bind_param("si", $token, $currentTime);
    $stmt->execute();
    $result = $stmt->get_result();
    $resetRequest = $result->fetch_assoc();

    if ($resetRequest) {
        // Update the user's password
        $email = $resetRequest['email'];
        $query = "UPDATE users SET password = ? WHERE email = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $password, $email);
        if ($stmt->execute()) {
            // Delete the reset token
            $query = "DELETE FROM password_resets WHERE token = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("s", $token);
            $stmt->execute();

            echo json_encode(['success' => true, 'message' => 'Your password has been reset successfully!']);
        } else {
            error_log("Database query failed: " . $stmt->error);
            echo json_encode(['success' => false, 'message' => 'Error updating password.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token.']);
    }

    $stmt->close();
}

mysqli_close($conn);
?>