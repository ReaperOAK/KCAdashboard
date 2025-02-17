<?php
// Update the require path to be absolute
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class Mailer {
    private $mail;
    private $config;

    public function __construct() {
        $this->config = require __DIR__ . '/../config/mail.php';
        $this->mail = new PHPMailer(true);

        // Server settings
        $this->mail->isSMTP();
        $this->mail->Host = $this->config['smtp_host'];
        $this->mail->SMTPAuth = true;
        $this->mail->Username = $this->config['smtp_username'];
        $this->mail->Password = $this->config['smtp_password'];
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $this->mail->Port = $this->config['smtp_port'];

        // Default settings
        $this->mail->setFrom($this->config['from_email'], $this->config['from_name']);
        $this->mail->isHTML(true);
    }

    public function sendPasswordReset($email, $token) {
        try {
            $resetLink = "https://dashboard.kolkatachessacademy.in/reset-password?token=" . $token;

            $this->mail->addAddress($email);
            $this->mail->Subject = 'Reset Your Password - KCA Dashboard';
            $this->mail->Body = "
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password. Click the link below to proceed:</p>
                <p><a href='{$resetLink}'>{$resetLink}</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            ";

            $this->mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            throw new Exception('Failed to send password reset email');
        }
    }
}
?>
