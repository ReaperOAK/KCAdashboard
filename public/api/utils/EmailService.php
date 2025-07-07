<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

class EmailService {
    private $mailer;
    private $fromEmail;
    private $fromName;
    
    public function __construct() {
        $this->mailer = new PHPMailer(true);
        // Load config
        $config = require __DIR__ . '/../config/mail.php';
        $this->fromEmail = $config['from_email'];
        $this->fromName = $config['from_name'];
        // Configure SMTP settings
        $this->mailer->isSMTP();
        $this->mailer->Host = $config['smtp_host'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $config['smtp_username'];
        $this->mailer->Password = $config['smtp_password'];
        $this->mailer->SMTPSecure = $config['smtp_secure'];
        $this->mailer->Port = $config['smtp_port'];
        $this->mailer->setFrom($this->fromEmail, $this->fromName);
    }
    
    /**
     * Send an email
     * 
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $body Email body
     * @param array $attachments Optional array of attachments
     * @return bool True if email was sent successfully
     */
    /**
     * Send an email with optional attachments. Sanitizes input and validates email.
     */
    public function sendEmail($to, $subject, $body, $attachments = []) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid recipient email: $to");
            }
            $this->mailer->addAddress(trim($to));
            $this->mailer->Subject = trim($subject);
            $this->mailer->Body = $body;
            // Add attachments if provided
            foreach ($attachments as $attachment) {
                if (isset($attachment['path']) && isset($attachment['name'])) {
                    $this->mailer->addAttachment($attachment['path'], $attachment['name']);
                }
            }
            $this->mailer->send();
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            return true;
        } catch (Exception $e) {
            error_log('Email sending failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send HTML email
     * 
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $htmlContent HTML content
     * @param string $plainTextContent Plain text alternative
     * @param array $attachments Optional array of attachments
     * @return bool True if email was sent successfully
     */
    /**
     * Send an HTML email with optional plain text and attachments. Sanitizes input and validates email.
     */
    public function sendHTMLEmail($to, $subject, $htmlContent, $plainTextContent = '', $attachments = []) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid recipient email: $to");
            }
            $this->mailer->addAddress(trim($to));
            $this->mailer->Subject = trim($subject);
            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlContent;
            if (!empty($plainTextContent)) {
                $this->mailer->AltBody = $plainTextContent;
            }
            // Add attachments if provided
            foreach ($attachments as $attachment) {
                if (isset($attachment['path']) && isset($attachment['name'])) {
                    $this->mailer->addAttachment($attachment['path'], $attachment['name']);
                }
            }
            $this->mailer->send();
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            return true;
        } catch (Exception $e) {
            error_log('HTML email sending failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send a notification email for new feedback
     * 
     * @param string $to Student email
     * @param string $studentName Student name
     * @param string $teacherName Teacher name
     * @param int $rating Feedback rating
     * @param string $comment Feedback comment
     * @return bool True if email was sent successfully
     */
    /**
     * Send a notification email for new feedback. Sanitizes all input.
     */
    public function sendFeedbackNotification($to, $studentName, $teacherName, $rating, $comment = '') {
        $subject = "New Feedback from your Teacher";
        $studentName = htmlspecialchars($studentName);
        $teacherName = htmlspecialchars($teacherName);
        $rating = intval($rating);
        $comment = htmlspecialchars($comment);
        // HTML content
        $htmlContent = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { padding: 20px; }
                .header { background-color: #200e4a; color: white; padding: 10px; }
                .rating { font-size: 18px; font-weight: bold; margin: 15px 0; }
                .footer { margin-top: 20px; font-size: 12px; color: #777; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Kolkata Chess Academy - Feedback Notification</h2>
                </div>
                <p>Hello {$studentName},</p>
                <p>Your teacher {$teacherName} has provided new feedback for you.</p>
                <div class='rating'>Rating: {$rating}/5</div>";
        if (!empty($comment)) {
            $htmlContent .= "<p><strong>Comment:</strong> {$comment}</p>";
        }
        $htmlContent .= "
                <p>Please log in to your dashboard to view the complete feedback.</p>
                <p>Regards,<br>Kolkata Chess Academy Team</p>
                <div class='footer'>
                    This is an automated message. Please do not reply to this email.
                </div>
            </div>
        </body>
        </html>";
        // Plain text alternative
        $plainText = "Hello {$studentName},\n\n";
        $plainText .= "Your teacher {$teacherName} has provided new feedback for you.\n\n";
        $plainText .= "Rating: {$rating}/5\n";
        if (!empty($comment)) {
            $plainText .= "Comment: {$comment}\n\n";
        }
        $plainText .= "Please log in to your dashboard to view the complete feedback.\n\n";
        $plainText .= "Regards,\nKolkata Chess Academy Team";
        return $this->sendHTMLEmail($to, $subject, $htmlContent, $plainText);
    }
}
?>
