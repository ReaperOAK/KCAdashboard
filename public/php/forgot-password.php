<?php
header('Content-Type: application/json');
require_once 'config.php';

// Get JSON POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

try {
    // Check if email exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND active = 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Email not found']);
        exit;
    }

    // Generate token
    $token = bin2hex(random_bytes(32));
    $expires = time() + (60 * 30); // 30 minutes expiry

    // Delete any existing reset tokens for this email
    $stmt = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    // Save new reset token
    $stmt = $conn->prepare("INSERT INTO password_resets (email, token, expires) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $email, $token, $expires);
    $stmt->execute();

    // Prepare reset link
    $resetLink = "https://yourdomain.com/reset-password?token=" . $token;

    // Email headers
    $to = $email;
    $subject = "Password Reset Request";
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Chess Academy <noreply@yourdomain.com>' . "\r\n";

    // Email body
    $message = "
    <html>
    <head>
        <title>Reset Your Password</title>
    </head>
    <body>
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a href='{$resetLink}'>Reset Password</a></p>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Chess Academy Team</p>
    </body>
    </html>
    ";

    // Send email
    if (mail($to, $subject, $message, $headers)) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Failed to send email');
    }

} catch (Exception $e) {
    error_log("Password reset error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your request'
    ]);
}

$conn->close();
?>
