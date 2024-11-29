<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);

    // Validate the token
    $query = "SELECT * FROM password_resets WHERE token = '$token' AND expires > " . time();
    $result = mysqli_query($conn, $query);
    $resetRequest = mysqli_fetch_assoc($result);

    if ($resetRequest) {
        // Update the user's password
        $email = $resetRequest['email'];
        $query = "UPDATE users SET password = '$password' WHERE email = '$email'";
        mysqli_query($conn, $query);

        // Delete the reset token
        $query = "DELETE FROM password_resets WHERE token = '$token'";
        mysqli_query($conn, $query);

        echo json_encode(['success' => true, 'message' => 'Your password has been reset successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token.']);
    }
}

mysqli_close($conn);
?>