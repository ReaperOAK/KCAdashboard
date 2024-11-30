<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $email = $data->email;

    // Check if the email exists in the database
    $query = "SELECT * FROM users WHERE email = '$email'";
    $result = mysqli_query($conn, $query);
    if (!$result) {
        error_log("Database query failed: " . mysqli_error($conn));
        echo json_encode(['success' => false, 'message' => 'Database query failed']);
        exit;
    }

    $user = mysqli_fetch_assoc($result);

    if ($user) {
        // Generate reset token
        $token = bin2hex(random_bytes(50));
        $expires = date('U') + 3600; // Token expires in 1 hour

        // Save token to database
        $query = "INSERT INTO password_resets (email, token, expires) VALUES ('$email', '$token', '$expires')";
        if (!mysqli_query($conn, $query)) {
            error_log("Database query failed: " . mysqli_error($conn));
            echo json_encode(['success' => false, 'message' => 'Database query failed']);
            exit;
        }

        // Send email with the reset link
        $resetLink = "https://dashboard.kolkatachessacademy.in/reset-password?token=$token";
        if (mail($email, "Password Reset Request", "Click here to reset your password: $resetLink")) {
            echo json_encode(['success' => true, 'message' => 'A password reset link has been sent to your email.']);
        } else {
            error_log("Failed to send email to $email");
            echo json_encode(['success' => false, 'message' => 'Failed to send email']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No account found with that email.']);
    }
}

mysqli_close($conn);
?>