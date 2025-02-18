<?php
// Remove autoloader requirement and use direct includes if not already included
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';
    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
    require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class Mailer {
    private $mail;
    private $config;

    public function __construct() {
        try {
            $this->config = require __DIR__ . '/../config/mail.php';
            $this->mail = new PHPMailer(true);

            // Debug settings
            $this->mail->SMTPDebug = SMTP::DEBUG_SERVER;
            $this->mail->Debugoutput = function($str, $level) {
                error_log("PHPMailer Debug: $str");
            };

            // Server settings
            $this->mail->isSMTP();
            $this->mail->Host = $this->config['smtp_host'];
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $this->config['smtp_username'];
            $this->mail->Password = $this->config['smtp_password'];
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $this->mail->Port = $this->config['smtp_port'];
            
            // Additional settings for troubleshooting
            $this->mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            // Default settings
            $this->mail->setFrom($this->config['from_email'], $this->config['from_name']);
            $this->mail->isHTML(true);
            
            error_log("Mailer initialized successfully");
        } catch (Exception $e) {
            error_log("Mailer initialization error: " . $e->getMessage());
            throw $e;
        }
    }

    public function sendPasswordReset($email, $token) {
        try {
            error_log("Attempting to send password reset email to: " . $email);
            
            // Clear all recipients first
            $this->mail->clearAddresses();
            
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

            $success = $this->mail->send();
            error_log("Email sent successfully: " . ($success ? 'true' : 'false'));
            return $success;
        } catch (Exception $e) {
            error_log("Email sending failed - Error: " . $e->getMessage());
            error_log("Mailer Error: " . $this->mail->ErrorInfo);
            throw new Exception('Failed to send password reset email: ' . $e->getMessage());
        }
    }
}
?>
