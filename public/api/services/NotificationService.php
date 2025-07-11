<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../services/EmailService.php';

class NotificationService {
    // Sanitize a string for safe DB and email use (PHP 8+ compatible)
    private function sanitize($str) {
        // Remove low/high ASCII, then escape HTML
        $str = filter_var($str, FILTER_UNSAFE_RAW, FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH);
        return trim(htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
    }

    // Validate user ID
    private function isValidUserId($user_id) {
        return is_numeric($user_id) && intval($user_id) > 0;
    }
    private $db;
    private $notification;
    private $user;
    private $emailService;

    // Notification templates by type
    private $templates = [
        'class_reminder' => [
            'title' => 'Class Reminder: {class_name}',
            'message' => 'Your {class_name} class is scheduled for {time} on {date}.',
            'category' => 'class'
        ],
        'tournament_invite' => [
            'title' => 'Tournament Invitation: {tournament_name}',
            'message' => 'You are invited to participate in {tournament_name} on {date}.',
            'category' => 'tournament'
        ],
        'assignment_due' => [
            'title' => 'Assignment Due: {assignment_name}',
            'message' => 'Your assignment {assignment_name} is due on {date}.',
            'category' => 'assignment'
        ],
        'attendance_alert' => [
            'title' => 'Attendance Alert',
            'message' => 'Your attendance has dropped below {threshold}% in {class_name}.',
            'category' => 'attendance'
        ],
        'general_announcement' => [
            'title' => '{title}',
            'message' => '{message}',
            'category' => 'announcement'
        ],
        'achievement' => [
            'title' => 'Achievement Unlocked: {achievement}',
            'message' => 'Congratulations! You have earned {achievement}.',
            'category' => 'achievement'
        ]
    ];

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->notification = new Notification($this->db);
        $this->user = new User($this->db);
        $this->emailService = new EmailService();
    }

    // Send notification using a template
    public function sendFromTemplate($user_id, $notificationType, $params = [], $sendEmail = false, $linkUrl = null) {
        if (!$this->isValidUserId($user_id)) {
            error_log("Invalid user_id in sendFromTemplate: $user_id");
            return false;
        }
        if (!isset($this->templates[$notificationType])) {
            throw new Exception("Notification template not found: $notificationType");
        }

        $template = $this->templates[$notificationType];

        // Sanitize params for placeholders
        foreach ($params as $k => $v) {
            $params[$k] = htmlspecialchars($this->sanitize($v));
        }

        // Replace placeholders with actual values
        $title = $this->replacePlaceholders($template['title'], $params);
        $message = $this->replacePlaceholders($template['message'], $params);
        $category = $template['category'];

        // Set notification properties
        $this->notification->user_id = intval($user_id);
        $this->notification->title = $this->sanitize($title);
        $this->notification->message = $this->sanitize($message);
        $this->notification->type = $notificationType;
        $this->notification->category = $this->sanitize($category);
        $this->notification->link = $linkUrl ? $this->sanitize($linkUrl) : null;
        $this->notification->email_sent = false;

        // Send notification
        $result = $this->notification->create();

        // If email should be sent
        if ($result && $sendEmail) {
            try {
                // Get user email
                $userInfo = $this->user->getById($user_id);
                if ($userInfo && !empty($userInfo['email'])) {
                    $email = filter_var($userInfo['email'], FILTER_SANITIZE_EMAIL);
                    $name = htmlspecialchars($this->sanitize($userInfo['full_name']));
                    // Send email
                    $emailResult = $this->emailService->sendNotificationEmail(
                        $email,
                        $name,
                        $title,
                        $message,
                        $category,
                        $linkUrl
                    );
                    // Update notification with email sent status
                    if ($emailResult) {
                        $this->notification->id = $this->db->lastInsertId();
                        $this->updateEmailSentStatus($this->notification->id, true);
                    }
                }
            } catch (Exception $e) {
                error_log("Failed to send email notification: " . $e->getMessage());
                // Continue even if email fails, the in-app notification was created
            }
        }

        return $result;
    }

    // Send notification to multiple users
    public function sendBulkFromTemplate($user_ids, $notificationType, $params = [], $sendEmail = false, $linkUrl = null) {
        $results = [
            'successful' => 0,
            'failed' => 0,
            'emails_sent' => 0
        ];

        foreach ($user_ids as $user_id) {
            if (!$this->isValidUserId($user_id)) {
                $results['failed']++;
                error_log("Invalid user_id in sendBulkFromTemplate: $user_id");
                continue;
            }
            try {
                $success = $this->sendFromTemplate($user_id, $notificationType, $params, $sendEmail, $linkUrl);
                if ($success) {
                    $results['successful']++;
                    if ($sendEmail) {
                        $results['emails_sent']++;
                    }
                } else {
                    $results['failed']++;
                }
            } catch (Exception $e) {
                $results['failed']++;
                error_log("Error sending notification to user $user_id: " . $e->getMessage());
            }
        }

        return $results;
    }

    // Send custom notification (without template)
    public function sendCustom($user_id, $title, $message, $category = 'general', $sendEmail = false, $linkUrl = null) {
        if (!$this->isValidUserId($user_id)) {
            error_log("Invalid user_id in sendCustom: $user_id");
            return false;
        }
        $this->notification->user_id = intval($user_id);
        $this->notification->title = $this->sanitize($title);
        $this->notification->message = $this->sanitize($message);
        $this->notification->type = 'custom';
        $this->notification->category = $this->sanitize($category);
        $this->notification->link = $linkUrl ? $this->sanitize($linkUrl) : null;
        $this->notification->email_sent = false;

        $result = $this->notification->create();

        if ($result && $sendEmail) {
            try {
                $userInfo = $this->user->getById($user_id);
                if ($userInfo && !empty($userInfo['email'])) {
                    $email = filter_var($userInfo['email'], FILTER_SANITIZE_EMAIL);
                    $name = htmlspecialchars($this->sanitize($userInfo['full_name']));
                    $emailResult = $this->emailService->sendNotificationEmail(
                        $email,
                        $name,
                        $title,
                        $message,
                        $category,
                        $linkUrl
                    );
                    if ($emailResult) {
                        $this->notification->id = $this->db->lastInsertId();
                        $this->updateEmailSentStatus($this->notification->id, true);
                    }
                }
            } catch (Exception $e) {
                error_log("Failed to send email notification: " . $e->getMessage());
            }
        }

        return $result;
    }

    // Send bulk custom notifications
    public function sendBulkCustom($user_ids, $title, $message, $category = 'general', $sendEmail = false, $linkUrl = null) {
        $results = [
            'successful' => 0,
            'failed' => 0,
            'emails_sent' => 0
        ];

        foreach ($user_ids as $user_id) {
            if (!$this->isValidUserId($user_id)) {
                $results['failed']++;
                error_log("Invalid user_id in sendBulkCustom: $user_id");
                continue;
            }
            try {
                $success = $this->sendCustom($user_id, $title, $message, $category, $sendEmail, $linkUrl);
                if ($success) {
                    $results['successful']++;
                    if ($sendEmail) {
                        $results['emails_sent']++;
                    }
                } else {
                    $results['failed']++;
                }
            } catch (Exception $e) {
                $results['failed']++;
                error_log("Error sending notification to user $user_id: " . $e->getMessage());
            }
        }

        return $results;
    }

    private function replacePlaceholders($text, $params) {
        foreach ($params as $key => $value) {
            $text = str_replace('{' . $key . '}', $value, $text);
        }
        return $text;
    }

    private function updateEmailSentStatus($notification_id, $status) {
        $query = "UPDATE notifications SET email_sent = :status WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':status', $status, PDO::PARAM_BOOL);
        $stmt->bindParam(':id', $notification_id, PDO::PARAM_INT);
        return $stmt->execute();
    }
    
    // Get all notification templates
    public function getTemplates() {
        return $this->templates;
    }
}
?>
