    /**
     * Sanitize a string for safe email headers and content
     */
    private function sanitize($str) {
        return trim(filter_var($str, FILTER_SANITIZE_STRING, FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH));
    }

    /**
     * Validate an email address
     */
    private function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
<?php
// First try to use composer autoloader if available
$vendorAutoloadPaths = [
    __DIR__ . '/../vendor/autoload.php',
    __DIR__ . '/../../vendor/autoload.php'
];

$autoloaderFound = false;
foreach ($vendorAutoloadPaths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $autoloaderFound = true;
        break;
    }
}

// Fallback to direct includes if autoloader not found
if (!$autoloaderFound || !class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    $phpmailerPaths = [
        __DIR__ . '/../vendor/phpmailer/phpmailer/src/',
        __DIR__ . '/../../vendor/phpmailer/phpmailer/src/'
    ];
    
    foreach ($phpmailerPaths as $path) {
        if (file_exists($path)) {
            require_once $path . 'Exception.php';
            require_once $path . 'PHPMailer.php';
            require_once $path . 'SMTP.php';
            break;
        }
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class Mailer {
    private $mailer;
    private $config;

    public function __construct() {
        try {
            if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
                error_log("PHPMailer class not found. Make sure it's installed correctly.");
                throw new Exception("Email system configuration error: PHPMailer not found");
            }
            
            $this->mailer = new PHPMailer(true);
            
            // Load config or use defaults if config file not found
            $configFile = __DIR__ . '/../config/mail.php';
            if (file_exists($configFile)) {
                $this->config = require $configFile;
            } else {
                error_log("Mail config file not found, using defaults");
                $this->config = [
                    'smtp_host' => 'smtp.hostinger.com',
                    'smtp_port' => 465,
                    'smtp_username' => 'no-reply@kolkatachessacademy.in',
                    'smtp_password' => getenv('SMTP_PASSWORD') ?: '',
                    'from_email' => 'no-reply@kolkatachessacademy.in',
                    'from_name' => 'Kolkata Chess Academy',
                    'smtp_secure' => 'ssl'
                ];
            }
            
            $this->setupMailer();
            
        } catch (Exception $e) {
            error_log("Mailer initialization error: " . $e->getMessage());
            throw new Exception("Failed to initialize mail system: " . $e->getMessage());
        }
    }

    private function setupMailer() {
        try {
            // Debug settings - set to 0 for production
            $this->mailer->SMTPDebug = 0;
            $this->mailer->Debugoutput = function($str, $level) {
                error_log("PHPMailer Debug: $str");
            };
            
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['smtp_host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['smtp_username'];
            $this->mailer->Password = $this->config['smtp_password'];
            $this->mailer->SMTPSecure = $this->config['smtp_secure'];
            $this->mailer->Port = $this->config['smtp_port'];
            $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);
            $this->mailer->isHTML(true);
            $this->mailer->CharSet = 'UTF-8';
            
            // Set additional options for reliability
            $this->mailer->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ];
            
            error_log("Mailer setup completed for: " . $this->config['smtp_username']);
            
        } catch (Exception $e) {
            error_log("Mailer setup failed: " . $e->getMessage());
            throw new Exception("Failed to configure email system: " . $e->getMessage());
        }
    }

    /**
     * Send a notification email for new feedback
     */
    /**
     * Send a notification email for new feedback. Sanitizes all input and validates email.
     */
    public function sendFeedbackNotification($to, $studentName, $teacherName, $rating, $comment = '', $areasOfImprovement = '', $strengths = '') {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            $to = $this->sanitize($to);
            if (!$this->isValidEmail($to)) {
                throw new Exception("Invalid recipient email: $to");
            }
            $studentName = htmlspecialchars($this->sanitize($studentName));
            $teacherName = htmlspecialchars($this->sanitize($teacherName));
            $rating = intval($rating);
            $comment = htmlspecialchars($this->sanitize($comment));
            $areasOfImprovement = htmlspecialchars($this->sanitize($areasOfImprovement));
            $strengths = htmlspecialchars($this->sanitize($strengths));
            $this->mailer->addAddress($to);
            $this->mailer->Subject = "New Feedback from your Teacher";
            // HTML content
            $htmlContent = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .container { padding: 20px; }
                    .header { background-color: #200e4a; color: white; padding: 10px; }
                    .rating { font-size: 18px; font-weight: bold; margin: 15px 0; }
                    .section { margin: 15px 0; }
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
                $htmlContent .= "<div class='section'><strong>Comment:</strong> {$comment}</div>";
            }
            if (!empty($strengths)) {
                $htmlContent .= "<div class='section'><strong>Your Strengths:</strong> {$strengths}</div>";
            }
            if (!empty($areasOfImprovement)) {
                $htmlContent .= "<div class='section'><strong>Areas for Improvement:</strong> {$areasOfImprovement}</div>";
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
            if (!empty($strengths)) {
                $plainText .= "Your Strengths: {$strengths}\n\n";
            }
            if (!empty($areasOfImprovement)) {
                $plainText .= "Areas for Improvement: {$areasOfImprovement}\n\n";
            }
            $plainText .= "Please log in to your dashboard to view the complete feedback.\n\n";
            $plainText .= "Regards,\nKolkata Chess Academy Team";
            $this->mailer->Body = $htmlContent;
            $this->mailer->AltBody = $plainText;
            $result = $this->mailer->send();
            error_log("Feedback notification sent to {$to} from teacher {$teacherName}");
            return $result;
        } catch (Exception $e) {
            error_log("Failed to send feedback notification to {$to}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send attendance reminder
     */
    public function sendAttendanceReminder($data) {
        try {
            $email = $this->sanitize($data['email']);
            $name = htmlspecialchars($this->sanitize($data['name']));
            $batch_name = htmlspecialchars($this->sanitize($data['batch_name']));
            if (!$this->isValidEmail($email)) {
                throw new Exception("Invalid recipient email: $email");
            }
            // Clear previous recipients
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();

            $this->mailer->addAddress($email, $name);
            $this->mailer->Subject = "Reminder: Upcoming Class - {$batch_name}";

            // Sanitize meeting_link and session_time if present
            $data['meeting_link'] = isset($data['meeting_link']) ? $this->sanitize($data['meeting_link']) : '';
            $data['session_time'] = isset($data['session_time']) ? $this->sanitize($data['session_time']) : '';
            $data['batch_name'] = $batch_name;
            $data['name'] = $name;

            $body = $this->getAttendanceReminderTemplate($data);
            $this->mailer->Body = $body;
            $this->mailer->AltBody = strip_tags($body);

            $result = $this->mailer->send();

            // Log successful send
            error_log("Attendance reminder sent to {$email} for batch {$batch_name}");

            return $result;
        } catch (Exception $e) {
            error_log("Failed to send attendance reminder to {$data['email']}: " . $e->getMessage());
            return false;
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

    /**
     * Send password reset email
     */
    public function sendPasswordReset($email, $token) {
        try {
            $email = $this->sanitize($email);
            if (!$this->isValidEmail($email)) {
                throw new Exception("Invalid recipient email: $email");
            }
            $token = htmlspecialchars($this->sanitize($token));
            // Clear previous recipients
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();

            $resetLink = "https://dashboard.kolkatachessacademy.in/reset-password?token=" . $token;

            $this->mailer->addAddress($email);
            $this->mailer->Subject = 'Reset Your Password - KCA Dashboard';
            $this->mailer->Body = "
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password. Click the link below to proceed:</p>
                <p><a href='{$resetLink}'>{$resetLink}</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            ";
            $this->mailer->AltBody = "You have requested to reset your password. Open this link to proceed: {$resetLink}";

            $result = $this->mailer->send();
            error_log("Password reset email sent to: {$email}");
            return $result;
        } catch (Exception $e) {
            error_log("Failed to send password reset email to {$email}: " . $e->getMessage());
            return false;
        }
    }

    // Test connection method
    public function testConnection() {
        try {
            // Turn on debug mode for testing
            $this->mailer->SMTPDebug = SMTP::DEBUG_SERVER;
            $result = $this->mailer->smtpConnect();
            $this->mailer->SMTPDebug = 0; // Turn debug off again
            return $result;
        } catch (Exception $e) {
            error_log("SMTP connection test failed: " . $e->getMessage());
            return false;
        }
    }
}
?>
