<?php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/NotificationPreference.php';
require_once __DIR__ . '/../services/EmailService.php';

class NotificationService {
    private $db;
    private $notification;
    private $user;
    private $emailService;
    private $notificationPreference;
    private $websocketEnabled = true;
    private $websocketHost = 'localhost';
    private $websocketPort = 8080;

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
        ],
        'new_message' => [
            'title' => 'New Message from {sender_name}',
            'message' => '{sender_name} sent you a message: "{message_preview}"',
            'category' => 'chat'
        ]
    ];

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->notification = new Notification($this->db);
        $this->user = new User($this->db);
        $this->emailService = new EmailService();
        $this->notificationPreference = new NotificationPreference($this->db);
        
        // Load configuration if available
        if (file_exists(__DIR__ . '/../config/websocket.php')) {
            include_once __DIR__ . '/../config/websocket.php';
            if (isset($WEBSOCKET_CONFIG)) {
                if (isset($WEBSOCKET_CONFIG['enabled'])) {
                    $this->websocketEnabled = $WEBSOCKET_CONFIG['enabled'];
                }
                if (isset($WEBSOCKET_CONFIG['host'])) {
                    $this->websocketHost = $WEBSOCKET_CONFIG['host'];
                }
                if (isset($WEBSOCKET_CONFIG['port'])) {
                    $this->websocketPort = $WEBSOCKET_CONFIG['port'];
                }
            }
        }
    }

    // Send notification using a template
    public function sendFromTemplate($user_id, $notificationType, $params = [], $sendEmail = false, $linkUrl = null) {
        if (!isset($this->templates[$notificationType])) {
            throw new Exception("Notification template not found: $notificationType");
        }

        // Check user notification preferences
        $userPreferences = $this->getUserPreferences($user_id);
        $category = $this->templates[$notificationType]['category'];
        
        // If in-app notifications are disabled for this category, skip it
        if (isset($userPreferences[$category]) && !$userPreferences[$category]['in_app']) {
            return false;
        }
        
        // If email is requested but disabled for this category, turn it off
        if ($sendEmail && isset($userPreferences[$category]) && !$userPreferences[$category]['email']) {
            $sendEmail = false;
        }

        $template = $this->templates[$notificationType];
        
        // Replace placeholders with actual values
        $title = $this->replacePlaceholders($template['title'], $params);
        $message = $this->replacePlaceholders($template['message'], $params);
        
        // Set notification properties
        $this->notification->user_id = $user_id;
        $this->notification->title = $title;
        $this->notification->message = $message;
        $this->notification->type = $notificationType;
        $this->notification->category = $category;
        $this->notification->link = $linkUrl;
        $this->notification->email_sent = false;
        
        // Create notification in database
        $result = $this->notification->create();
        
        if ($result) {
            $notificationId = $this->db->lastInsertId();
            
            // Prepare notification data for real-time delivery
            $notificationData = [
                'id' => $notificationId,
                'user_id' => $user_id,
                'title' => $title,
                'message' => $message,
                'type' => $notificationType,
                'category' => $category,
                'link' => $linkUrl,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            // Send via WebSocket for real-time delivery
            $this->sendRealTimeNotification($user_id, $notificationData);
            
            // Send email if requested and allowed by preferences
            if ($sendEmail) {
                $this->sendEmailNotification($user_id, $title, $message, $category, $linkUrl, $notificationId);
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
        // Check user notification preferences
        $userPreferences = $this->getUserPreferences($user_id);
        
        // If in-app notifications are disabled for this category, skip it
        if (isset($userPreferences[$category]) && !$userPreferences[$category]['in_app']) {
            return false;
        }
        
        // If email is requested but disabled for this category, turn it off
        if ($sendEmail && isset($userPreferences[$category]) && !$userPreferences[$category]['email']) {
            $sendEmail = false;
        }
        
        $this->notification->user_id = $user_id;
        $this->notification->title = $title;
        $this->notification->message = $message;
        $this->notification->type = 'custom';
        $this->notification->category = $category;
        $this->notification->link = $linkUrl;
        $this->notification->email_sent = false;
        
        $result = $this->notification->create();
        
        if ($result) {
            $notificationId = $this->db->lastInsertId();
            
            // Prepare notification data for real-time delivery
            $notificationData = [
                'id' => $notificationId,
                'user_id' => $user_id,
                'title' => $title,
                'message' => $message,
                'type' => 'custom',
                'category' => $category,
                'link' => $linkUrl,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            // Send via WebSocket for real-time delivery
            $this->sendRealTimeNotification($user_id, $notificationData);
            
            // Send email if requested and allowed by preferences
            if ($sendEmail) {
                $this->sendEmailNotification($user_id, $title, $message, $category, $linkUrl, $notificationId);
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
    
    /**
     * Send a notification via WebSocket for real-time delivery
     * @param int $userId
     * @param array $notificationData
     * @return bool
     */
    private function sendRealTimeNotification($userId, $notificationData) {
        // Skip if WebSocket is disabled
        if (!$this->websocketEnabled) {
            return false;
        }
        
        try {
            // Open WebSocket connection
            $context = stream_context_create();
            $socket = @stream_socket_client(
                "tcp://{$this->websocketHost}:{$this->websocketPort}",
                $errno,
                $errstr,
                5,
                STREAM_CLIENT_CONNECT,
                $context
            );
            
            if (!$socket) {
                error_log("Failed to connect to WebSocket server: $errstr ($errno)");
                return false;
            }
            
            // Format WebSocket handshake headers
            $key = base64_encode(openssl_random_pseudo_bytes(16));
            $headers = "GET / HTTP/1.1\r\n";
            $headers .= "Host: {$this->websocketHost}:{$this->websocketPort}\r\n";
            $headers .= "Upgrade: websocket\r\n";
            $headers .= "Connection: Upgrade\r\n";
            $headers .= "Sec-WebSocket-Key: $key\r\n";
            $headers .= "Sec-WebSocket-Version: 13\r\n\r\n";
            
            // Send handshake
            fwrite($socket, $headers);
            
            // Read and process handshake response
            $response = fread($socket, 1024);
            if (strpos($response, "HTTP/1.1 101") === false) {
                error_log("WebSocket handshake failed: $response");
                fclose($socket);
                return false;
            }
            
            // Prepare WebSocket frame
            $data = json_encode([
                'type' => 'notification',
                'to_user_id' => $userId,
                'notification' => $notificationData
            ]);
            
            // Send data as WebSocket frame
            $frameData = $this->encodeWebSocketFrame($data);
            fwrite($socket, $frameData);
            
            // Close connection
            fclose($socket);
            return true;
        } catch (Exception $e) {
            error_log("WebSocket error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Encode data as a WebSocket frame
     * @param string $data
     * @return string
     */
    private function encodeWebSocketFrame($data) {
        $length = strlen($data);
        $frameHead = [];
        $frameHead[0] = 129; // 0x81, text frame (FIN + opcode)
        
        if ($length <= 125) {
            $frameHead[1] = $length;
        } elseif ($length <= 65535) {
            $frameHead[1] = 126;
            $frameHead[2] = ($length >> 8) & 255;
            $frameHead[3] = $length & 255;
        } else {
            $frameHead[1] = 127;
            $frameHead[2] = ($length >> 56) & 255;
            $frameHead[3] = ($length >> 48) & 255;
            $frameHead[4] = ($length >> 40) & 255;
            $frameHead[5] = ($length >> 32) & 255;
            $frameHead[6] = ($length >> 24) & 255;
            $frameHead[7] = ($length >> 16) & 255;
            $frameHead[8] = ($length >> 8) & 255;
            $frameHead[9] = $length & 255;
        }
        
        $frame = '';
        foreach ($frameHead as $byte) {
            $frame .= chr($byte);
        }
        $frame .= $data;
        
        return $frame;
    }
    
    /**
     * Send an email notification
     * @param int $userId
     * @param string $title
     * @param string $message
     * @param string $category
     * @param string $linkUrl
     * @param int $notificationId
     * @return bool
     */
    private function sendEmailNotification($userId, $title, $message, $category, $linkUrl, $notificationId) {
        try {
            // Get user email
            $userInfo = $this->user->getById($userId);
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
                    $this->updateEmailSentStatus($notificationId, true);
                    return true;
                }
            }
        } catch (Exception $e) {
            error_log("Failed to send email notification: " . $e->getMessage());
        }
        return false;
    }
    
    /**
     * Get user notification preferences
     * @param int $userId
     * @return array
     */
    private function getUserPreferences($userId) {
        try {
            $result = $this->notificationPreference->getUserPreferences($userId);
            if ($result['success'] && !empty($result['data'])) {
                $preferences = [];
                foreach ($result['data'] as $pref) {
                    $preferences[$pref['category']] = [
                        'in_app' => (bool)$pref['in_app'],
                        'email' => (bool)$pref['email']
                    ];
                }
                return $preferences;
            }
        } catch (Exception $e) {
            error_log("Error getting user preferences: " . $e->getMessage());
        }
        
        // Default to allowing all notifications if preferences not found
        return [];
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
