<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../services/EmailService.php';

class NotificationService {
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
        if (!isset($this->templates[$notificationType])) {
            throw new Exception("Notification template not found: $notificationType");
        }

        $template = $this->templates[$notificationType];
        
        // Replace placeholders with actual values
        $title = $this->replacePlaceholders($template['title'], $params);
        $message = $this->replacePlaceholders($template['message'], $params);
        $category = $template['category'];
        
        // Set notification properties
        $this->notification->user_id = $user_id;
        $this->notification->title = $title;
        $this->notification->message = $message;
        $this->notification->type = $notificationType;
        $this->notification->category = $category;
        $this->notification->link = $linkUrl;
        $this->notification->email_sent = false;
        
        // Send notification
        $result = $this->notification->create();
        
        // If email should be sent
        if ($result && $sendEmail) {
            try {
                // Get user email
                $userInfo = $this->user->getById($user_id);
                if ($userInfo && !empty($userInfo['email'])) {
                    // Send email
                    $emailResult = $this->emailService->sendNotificationEmail(
                        $userInfo['email'],
                        $userInfo['full_name'],
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
        $this->notification->user_id = $user_id;
        $this->notification->title = $title;
        $this->notification->message = $message;
        $this->notification->type = 'custom';
        $this->notification->category = $category;
        $this->notification->link = $linkUrl;
        $this->notification->email_sent = false;
        
        $result = $this->notification->create();
        
        if ($result && $sendEmail) {
            try {
                $userInfo = $this->user->getById($user_id);
                if ($userInfo && !empty($userInfo['email'])) {
                    $emailResult = $this->emailService->sendNotificationEmail(
                        $userInfo['email'],
                        $userInfo['full_name'],
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
