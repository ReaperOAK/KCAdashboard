<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class Mailer {
    private $mailer;
    private $config;

    public function __construct() {
        $this->mailer = new PHPMailer(true);
        $this->config = require __DIR__ . '/../config/mail.php';
        $this->setupMailer();
    }

    private function setupMailer() {
        try {
            $this->mailer->SMTPDebug = defined('MAIL_DEBUG') && MAIL_DEBUG ? SMTP::DEBUG_SERVER : SMTP::DEBUG_OFF;
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['smtp_host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['smtp_username'];
            $this->mailer->Password = $this->config['smtp_password'];
            $this->mailer->SMTPSecure = $this->config['smtp_secure'];
            $this->mailer->Port = $this->config['smtp_port'];
            $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);
            $this->mailer->isHTML(true);
            
            // Set additional options for reliability
            $this->mailer->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ];
        } catch (Exception $e) {
            error_log("Mailer setup failed: " . $e->getMessage());
            throw new Exception("Failed to configure email system");
        }
    }

    public function sendAttendanceReminder($data) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($data['email'], $data['name']);
            $this->mailer->Subject = "Reminder: Upcoming Class - {$data['batch_name']}";
            
            $body = $this->getAttendanceReminderTemplate($data);
            $this->mailer->Body = $body;
            $this->mailer->AltBody = strip_tags($body);
            
            $result = $this->mailer->send();
            
            // Log successful send
            error_log("Attendance reminder sent to {$data['email']} for batch {$data['batch_name']}");
            
            return $result;
        } catch (Exception $e) {
            error_log("Failed to send attendance reminder to {$data['email']}: " . $e->getMessage());
            throw new Exception("Failed to send attendance reminder");
        }
    }

    private function getAttendanceReminderTemplate($data) {
        $time = date('g:i A', strtotime($data['session_time']));
        $date = date('l, F j, Y', strtotime($data['session_time']));
        
        return "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #200e4a;'>Class Reminder</h2>
                <p>Dear {$data['name']},</p>
                <p>This is a reminder that you have an upcoming class:</p>
                <div style='background: #f3f1f9; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                    <p><strong>Batch:</strong> {$data['batch_name']}</p>
                    <p><strong>Date:</strong> {$date}</p>
                    <p><strong>Time:</strong> {$time}</p>
                    " . ($data['meeting_link'] ? "
                    <p><strong>Join Class:</strong><br>
                        <a href='{$data['meeting_link']}' 
                           style='background: #461fa3; color: white; padding: 10px 20px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block; 
                                  margin-top: 10px;'>
                            Join Online Class
                        </a>
                    </p>" : "") . "
                </div>
                <p>Please ensure you join the class on time.</p>
                <p>Best regards,<br>KCA Academy</p>
            </div>
        ";
    }

    // Additional method for testing connection
    public function testConnection() {
        try {
            $this->mailer->SMTPDebug = SMTP::DEBUG_SERVER;
            return $this->mailer->smtpConnect();
        } catch (Exception $e) {
            error_log("SMTP connection test failed: " . $e->getMessage());
            return false;
        }
    }
}
?>
