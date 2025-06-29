<?php
// This is a stub for sending email verification. In production, use a real mailer.
// Usage: include and call send_verification_email($email, $token)
require_once '../../utils/EmailService.php';
function send_verification_email($email, $token) {
    $verification_link = "https://dashboard.kolkatachessacademy.in/verify-email?token=" . urlencode($token);
    $subject = "Verify your email address";
    $body = "<p>Thank you for registering at Kolkata Chess Academy.</p>"
        . "<p>Please verify your email by clicking the link below:</p>"
        . "<p><a href='" . $verification_link . "'>Verify Email</a></p>"
        . "<p>If you did not register, please ignore this email.</p>";
    $plain = "Thank you for registering at Kolkata Chess Academy.\n"
        . "Please verify your email by visiting: $verification_link\n"
        . "If you did not register, please ignore this email.";
    $mailer = new EmailService();
    $result = $mailer->sendHTMLEmail($email, $subject, $body, $plain);
    if (!$result) {
        error_log("Failed to send verification email to $email");
    }
    return $result;
}
?>
