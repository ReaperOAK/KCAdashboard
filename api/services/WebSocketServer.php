<?php
// WebSocketServer.php - WebSocket server for real-time notifications

namespace Services;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Notification.php';

/**
 * WebSocket server implementation for real-time notifications
 */
class WebSocketServer implements MessageComponentInterface {
    protected $clients;
    private $userConnections;
    private $db;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->userConnections = []; // Map user IDs to their connection objects
        
        // Initialize database connection
        $database = new \Database();
        $this->db = $database->connect();
        
        echo "WebSocket server initialized\n";
    }

    /**
     * Handle new connection
     * @param ConnectionInterface $conn
     */
    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    /**
     * Handle incoming message
     * @param ConnectionInterface $from
     * @param string $msg
     */
    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        
        if (!$data || !isset($data['type'])) {
            echo "Invalid message format\n";
            return;
        }
        
        echo "Message type: {$data['type']}\n";
        
        switch ($data['type']) {
            case 'auth':
                // Authenticate user and store connection
                if (isset($data['token'])) {
                    $this->authenticateUser($from, $data['token']);
                }
                break;
                
            case 'notification':
                // Handle sending a notification
                if (isset($data['to_user_id']) && isset($data['notification'])) {
                    $this->sendNotification($data['to_user_id'], $data['notification']);
                }
                break;
                
            case 'chat_message':
                // Handle new chat message
                if (isset($data['conversation_id']) && isset($data['message'])) {
                    $this->broadcastChatMessage($data['conversation_id'], $data['message']);
                }
                break;
                
            case 'typing':
                // Handle typing indicator
                if (isset($data['conversation_id']) && isset($data['user_id'])) {
                    $this->broadcastTypingStatus($data['conversation_id'], $data['user_id'], true);
                }
                break;
                
            case 'stopped_typing':
                // Handle stopped typing indicator
                if (isset($data['conversation_id']) && isset($data['user_id'])) {
                    $this->broadcastTypingStatus($data['conversation_id'], $data['user_id'], false);
                }
                break;
        }
    }

    /**
     * Handle connection close
     * @param ConnectionInterface $conn
     */
    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        
        // Remove from user connections
        foreach ($this->userConnections as $userId => $userConn) {
            if ($userConn === $conn) {
                unset($this->userConnections[$userId]);
                echo "User {$userId} disconnected\n";
                break;
            }
        }
        
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    /**
     * Handle error
     * @param ConnectionInterface $conn
     * @param \Exception $e
     */
    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
    
    /**
     * Authenticate user with JWT token
     * @param ConnectionInterface $conn
     * @param string $token
     */
    private function authenticateUser(ConnectionInterface $conn, $token) {
        try {
            // Verify JWT token and get user ID
            require_once __DIR__ . '/../middleware/auth.php';
            $user = \verifyToken($token);
            
            if ($user && isset($user['id'])) {
                $userId = $user['id'];
                $this->userConnections[$userId] = $conn;
                
                // Send confirmation to the client
                $conn->send(json_encode([
                    'type' => 'auth_success',
                    'user_id' => $userId
                ]));
                
                echo "User {$userId} authenticated\n";
                
                // Send any pending notifications
                $this->sendPendingNotifications($userId);
            } else {
                $conn->send(json_encode([
                    'type' => 'auth_error',
                    'message' => 'Invalid token'
                ]));
            }
        } catch (\Exception $e) {
            echo "Authentication error: {$e->getMessage()}\n";
            $conn->send(json_encode([
                'type' => 'auth_error',
                'message' => 'Authentication failed'
            ]));
        }
    }
    
    /**
     * Send notification to a specific user
     * @param int $userId
     * @param array $notification
     */
    private function sendNotification($userId, $notification) {
        // If user is connected, send notification immediately
        if (isset($this->userConnections[$userId])) {
            $this->userConnections[$userId]->send(json_encode([
                'type' => 'notification',
                'data' => $notification
            ]));
            
            echo "Notification sent to user {$userId}\n";
        } else {
            echo "User {$userId} not connected, notification will be delivered later\n";
        }
    }
    
    /**
     * Send pending notifications to user
     * @param int $userId
     */
    private function sendPendingNotifications($userId) {
        try {
            // Get notification model
            $notification = new \Notification($this->db);
            
            // Get unread notifications for user
            $result = $notification->getUserNotifications($userId, false); // false = only unread
            
            if ($result['success'] && !empty($result['data'])) {
                // Send all notifications to the user
                $this->userConnections[$userId]->send(json_encode([
                    'type' => 'pending_notifications',
                    'data' => $result['data']
                ]));
                
                echo "Sent " . count($result['data']) . " pending notifications to user {$userId}\n";
            }
        } catch (\Exception $e) {
            echo "Error sending pending notifications: {$e->getMessage()}\n";
        }
    }
    
    /**
     * Broadcast chat message to all participants in a conversation
     * @param int $conversationId
     * @param array $messageData
     */
    private function broadcastChatMessage($conversationId, $messageData) {
        try {
            // Get conversation participants from the database
            $stmt = $this->db->prepare("
                SELECT user_id 
                FROM conversation_participants 
                WHERE conversation_id = :conversationId
            ");
            $stmt->execute(['conversationId' => $conversationId]);
            $participants = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            
            // Broadcast message to all connected participants
            foreach ($participants as $userId) {
                if (isset($this->userConnections[$userId])) {
                    $this->userConnections[$userId]->send(json_encode([
                        'type' => 'chat_message',
                        'conversation_id' => $conversationId,
                        'data' => $messageData
                    ]));
                }
            }
            
            echo "Chat message broadcasted to conversation {$conversationId}\n";
        } catch (\Exception $e) {
            echo "Error broadcasting chat message: {$e->getMessage()}\n";
        }
    }
    
    /**
     * Broadcast typing status to all participants in a conversation
     * @param int $conversationId
     * @param int $userId
     * @param bool $isTyping
     */
    private function broadcastTypingStatus($conversationId, $userId, $isTyping) {
        try {
            // Get conversation participants from the database
            $stmt = $this->db->prepare("
                SELECT user_id 
                FROM conversation_participants 
                WHERE conversation_id = :conversationId
            ");
            $stmt->execute(['conversationId' => $conversationId]);
            $participants = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            
            // Get user info
            $stmt = $this->db->prepare("
                SELECT full_name 
                FROM users 
                WHERE id = :userId
            ");
            $stmt->execute(['userId' => $userId]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                echo "User {$userId} not found\n";
                return;
            }
            
            // Broadcast status to all connected participants except the sender
            foreach ($participants as $participantId) {
                if ($participantId != $userId && isset($this->userConnections[$participantId])) {
                    $this->userConnections[$participantId]->send(json_encode([
                        'type' => $isTyping ? 'typing' : 'stopped_typing',
                        'conversation_id' => $conversationId,
                        'user_id' => $userId,
                        'user_name' => $user['full_name']
                    ]));
                }
            }
            
            $status = $isTyping ? 'typing' : 'stopped typing';
            echo "User {$userId} {$status} status broadcasted to conversation {$conversationId}\n";
        } catch (\Exception $e) {
            echo "Error broadcasting typing status: {$e->getMessage()}\n";
        }
    }
}

// Create WebSocket server
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new WebSocketServer()
        )
    ),
    8080 // WebSocket port
);

echo "WebSocket server started on port 8080\n";
$server->run();
?>