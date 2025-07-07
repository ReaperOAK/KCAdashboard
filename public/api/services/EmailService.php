<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Include PHPMailer autoloader
require_once __DIR__ . '/../vendor/autoload.php';

class EmailService {
    private $mail;
    private $config;
    
    public function __construct() {
        // Load mail configuration
        $this->config = require_once __DIR__ . '/../config/mail.php';
        
        // Initialize PHPMailer
        $this->mail = new PHPMailer(true);
        $this->setupMailer();
    }
    
    private function setupMailer() {
        try {
            // Server settings
            $this->mail->isSMTP();
            $this->mail->Host = $this->config['smtp_host'];
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $this->config['smtp_username'];
            $this->mail->Password = $this->config['smtp_password'];
            $this->mail->SMTPSecure = $this->config['smtp_secure'];
            $this->mail->Port = $this->config['smtp_port'];
            $this->mail->setFrom($this->config['from_email'], $this->config['from_name']);
            $this->mail->isHTML(true);
        } catch (Exception $e) {
            error_log("PHPMailer setup failed: " . $e->getMessage());
            throw new Exception("Email service initialization failed");
        }
    }
    
    /**
     * Send a notification email to a user. Returns true if sent, false otherwise.
     * Sanitizes all input and ensures no duplicate recipients.
     */
    public function sendNotificationEmail($to_email, $to_name, $subject, $message, $category = 'general', $link = null) {
        try {
            // Reset all recipients and attachments
            $this->mail->clearAddresses();
            $this->mail->clearAttachments();
            // Validate email
            if (!filter_var($to_email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid recipient email: $to_email");
            }
            // Add recipient
            $this->mail->addAddress(trim($to_email), trim($to_name));
            // Set email subject
            $this->mail->Subject = trim($subject);
            // Generate email body using template
            $body = $this->generateEmailTemplate($subject, $message, $category, $link);
            $this->mail->Body = $body;
            // Plain text version
            $this->mail->AltBody = strip_tags(str_replace(['<br>', '<br/>'], "\n", $message));
            // Send email
            return $this->mail->send();
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }
    
    private function generateEmailTemplate($subject, $message, $category, $link) {
        // Get category color
        $color = $this->getCategoryColor($category);
        
        // Build the HTML template
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>' . htmlspecialchars($subject) . '</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #200e4a; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f3f1f9; padding: 20px; border-radius: 5px; }
                .category-badge { display: inline-block; background-color: ' . $color . '; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; margin-bottom: 15px; }
                .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
                .btn { display: inline-block; background-color: #461fa3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Kolkata Chess Academy</h1>
                </div>
                <div class="content">
                    <div class="category-badge">' . ucfirst(htmlspecialchars($category)) . '</div>
                    <h2>' . htmlspecialchars($subject) . '</h2>
                    <p>' . nl2br(htmlspecialchars($message)) . '</p>';
        
        // Add button if link is provided
        if ($link) {
            $html .= '<p style="margin-top: 20px;"><a href="' . htmlspecialchars($link) . '" class="btn">View Details</a></p>';
        }
        
        $html .= '
                </div>
                <div class="footer">
                    <p>This is an automated notification from Kolkata Chess Academy.</p>
                    <p>© ' . date('Y') . ' Kolkata Chess Academy. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>';
        
        return $html;
    }
    
    private function getCategoryColor($category) {
        $colors = [
            'class' => '#461fa3',
            'tournament' => '#7646eb',
            'assignment' => '#af0505',
            'attendance' => '#ff9800',
            'announcement' => '#2196f3',
            'achievement' => '#4caf50',
            'general' => '#200e4a'
        ];
        
        return $colors[$category] ?? $colors['general'];
    }
}
?>
