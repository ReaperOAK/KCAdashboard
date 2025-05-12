<?php
// Chat.php - Model class for handling chat-related operations

class Chat {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Get conversations for a user
     * @param int $userId
     * @return array
     */
    public function getUserConversations($userId) {
        try {
            // Get all conversations where the user is involved
            $query = "
                SELECT 
                    c.id, 
                    c.name, 
                    c.type, 
                    c.created_at,
                    c.updated_at,
                    (
                        SELECT COUNT(*) 
                        FROM chat_messages cm 
                        JOIN chat_read_status crs ON cm.id = crs.message_id
                        WHERE cm.conversation_id = c.id 
                        AND crs.user_id = :userId 
                        AND crs.is_read = 0
                    ) as unread_count,
                    (
                        SELECT cm.content
                        FROM chat_messages cm
                        WHERE cm.conversation_id = c.id
                        ORDER BY cm.created_at DESC
                        LIMIT 1
                    ) as last_message,
                    (
                        SELECT u.full_name
                        FROM users u
                        JOIN chat_messages cm ON u.id = cm.sender_id
                        WHERE cm.conversation_id = c.id
                        ORDER BY cm.created_at DESC
                        LIMIT 1
                    ) as last_sender,
                    (
                        SELECT cm.created_at
                        FROM chat_messages cm
                        WHERE cm.conversation_id = c.id
                        ORDER BY cm.created_at DESC
                        LIMIT 1
                    ) as last_message_time
                FROM conversations c
                JOIN conversation_participants cp ON c.id = cp.conversation_id
                WHERE cp.user_id = :userId
                ORDER BY c.updated_at DESC
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['userId' => $userId]);
            $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get participants for each conversation
            foreach ($conversations as &$conversation) {
                $conversation['participants'] = $this->getConversationParticipants($conversation['id']);
            }

            return ['success' => true, 'data' => $conversations];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to get conversations', 'error' => $e->getMessage()];
        }
    }

    /**
     * Get participants of a conversation
     * @param int $conversationId
     * @return array
     */
    public function getConversationParticipants($conversationId) {
        try {
            $query = "
                SELECT 
                    u.id, 
                    u.full_name, 
                    u.email, 
                    u.profile_picture,
                    u.role
                FROM users u
                JOIN conversation_participants cp ON u.id = cp.user_id
                WHERE cp.conversation_id = :conversationId
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['conversationId' => $conversationId]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }

    /**
     * Get messages from a conversation
     * @param int $conversationId
     * @param int $userId
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getConversationMessages($conversationId, $userId, $limit = 50, $offset = 0) {
        try {
            // First verify if the user is part of this conversation
            $checkQuery = "
                SELECT COUNT(*) as count
                FROM conversation_participants
                WHERE conversation_id = :conversationId AND user_id = :userId
            ";
            
            $stmt = $this->db->prepare($checkQuery);
            $stmt->execute([
                'conversationId' => $conversationId,
                'userId' => $userId
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result['count'] == 0) {
                return ['success' => false, 'message' => 'You are not a participant in this conversation'];
            }
            
            // Get messages
            $query = "
                SELECT 
                    cm.id, 
                    cm.content, 
                    cm.created_at,
                    cm.sender_id,
                    u.full_name as sender_name,
                    u.profile_picture as sender_avatar,
                    u.role as sender_role
                FROM chat_messages cm
                JOIN users u ON cm.sender_id = u.id
                WHERE cm.conversation_id = :conversationId
                ORDER BY cm.created_at DESC
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':conversationId', $conversationId, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Mark messages as read
            $this->markMessagesAsRead($conversationId, $userId);
            
            return ['success' => true, 'data' => array_reverse($messages)]; // Reverse to get oldest first
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to get messages', 'error' => $e->getMessage()];
        }
    }

    /**
     * Send a message in a conversation
     * @param int $conversationId
     * @param int $senderId
     * @param string $content
     * @return array
     */
    public function sendMessage($conversationId, $senderId, $content) {
        try {
            // First verify if the user is part of this conversation
            $checkQuery = "
                SELECT COUNT(*) as count
                FROM conversation_participants
                WHERE conversation_id = :conversationId AND user_id = :userId
            ";
            
            $stmt = $this->db->prepare($checkQuery);
            $stmt->execute([
                'conversationId' => $conversationId,
                'userId' => $senderId
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result['count'] == 0) {
                return ['success' => false, 'message' => 'You are not a participant in this conversation'];
            }
            
            // Insert the message
            $query = "
                INSERT INTO chat_messages (conversation_id, sender_id, content, created_at)
                VALUES (:conversationId, :senderId, :content, NOW())
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                'conversationId' => $conversationId,
                'senderId' => $senderId,
                'content' => $content
            ]);
            
            $messageId = $this->db->lastInsertId();
            
            // Update conversation's updated_at timestamp
            $this->updateConversationTimestamp($conversationId);
            
            // Create read status entries for all participants (sender has read, others haven't)
            $this->createReadStatusEntries($conversationId, $messageId, $senderId);
            
            // Get the newly created message
            $query = "
                SELECT 
                    cm.id, 
                    cm.content, 
                    cm.created_at,
                    cm.sender_id,
                    u.full_name as sender_name,
                    u.profile_picture as sender_avatar,
                    u.role as sender_role
                FROM chat_messages cm
                JOIN users u ON cm.sender_id = u.id
                WHERE cm.id = :messageId
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['messageId' => $messageId]);
            
            $message = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return ['success' => true, 'data' => $message];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to send message', 'error' => $e->getMessage()];
        }
    }

    /**
     * Create a new conversation
     * @param string $name
     * @param string $type
     * @param array $participantIds
     * @return array
     */
    public function createConversation($name, $type, $participantIds) {
        try {
            $this->db->beginTransaction();
            
            // Create the conversation
            $query = "
                INSERT INTO conversations (name, type, created_at, updated_at)
                VALUES (:name, :type, NOW(), NOW())
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                'name' => $name,
                'type' => $type
            ]);
            
            $conversationId = $this->db->lastInsertId();
            
            // Add participants
            foreach ($participantIds as $userId) {
                $query = "
                    INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
                    VALUES (:conversationId, :userId, NOW())
                ";
                
                $stmt = $this->db->prepare($query);
                $stmt->execute([
                    'conversationId' => $conversationId,
                    'userId' => $userId
                ]);
            }
            
            $this->db->commit();
            
            // Get the created conversation details
            $query = "
                SELECT id, name, type, created_at, updated_at
                FROM conversations
                WHERE id = :conversationId
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['conversationId' => $conversationId]);
            
            $conversation = $stmt->fetch(PDO::FETCH_ASSOC);
            $conversation['participants'] = $this->getConversationParticipants($conversationId);
            
            return ['success' => true, 'data' => $conversation];
        } catch (PDOException $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Failed to create conversation', 'error' => $e->getMessage()];
        }
    }

    /**
     * Add a user to a conversation
     * @param int $conversationId
     * @param int $userId
     * @return array
     */
    public function addUserToConversation($conversationId, $userId) {
        try {
            // Check if user is already in the conversation
            $checkQuery = "
                SELECT COUNT(*) as count
                FROM conversation_participants
                WHERE conversation_id = :conversationId AND user_id = :userId
            ";
            
            $stmt = $this->db->prepare($checkQuery);
            $stmt->execute([
                'conversationId' => $conversationId,
                'userId' => $userId
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result['count'] > 0) {
                return ['success' => false, 'message' => 'User is already in this conversation'];
            }
            
            // Add user to the conversation
            $query = "
                INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
                VALUES (:conversationId, :userId, NOW())
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                'conversationId' => $conversationId,
                'userId' => $userId
            ]);
            
            return ['success' => true, 'message' => 'User added to conversation'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to add user to conversation', 'error' => $e->getMessage()];
        }
    }

    /**
     * Remove a user from a conversation
     * @param int $conversationId
     * @param int $userId
     * @return array
     */
    public function removeUserFromConversation($conversationId, $userId) {
        try {
            $query = "
                DELETE FROM conversation_participants
                WHERE conversation_id = :conversationId AND user_id = :userId
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                'conversationId' => $conversationId,
                'userId' => $userId
            ]);
            
            if ($stmt->rowCount() === 0) {
                return ['success' => false, 'message' => 'User is not in this conversation'];
            }
            
            return ['success' => true, 'message' => 'User removed from conversation'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to remove user from conversation', 'error' => $e->getMessage()];
        }
    }

    /**
     * Mark messages in a conversation as read for a user
     * @param int $conversationId
     * @param int $userId
     * @return bool
     */
    private function markMessagesAsRead($conversationId, $userId) {
        try {
            $query = "
                UPDATE chat_read_status crs
                JOIN chat_messages cm ON crs.message_id = cm.id
                SET crs.is_read = 1, crs.read_at = NOW()
                WHERE cm.conversation_id = :conversationId
                AND crs.user_id = :userId
                AND crs.is_read = 0
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                'conversationId' => $conversationId,
                'userId' => $userId
            ]);
            
            return true;
        } catch (PDOException $e) {
            // Log error but don't stop execution
            error_log('Error marking messages as read: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Update the timestamp of a conversation
     * @param int $conversationId
     * @return bool
     */
    private function updateConversationTimestamp($conversationId) {
        try {
            $query = "
                UPDATE conversations
                SET updated_at = NOW()
                WHERE id = :conversationId
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['conversationId' => $conversationId]);
            
            return true;
        } catch (PDOException $e) {
            // Log error but don't stop execution
            error_log('Error updating conversation timestamp: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create read status entries for a new message
     * @param int $conversationId
     * @param int $messageId
     * @param int $senderId
     * @return bool
     */
    private function createReadStatusEntries($conversationId, $messageId, $senderId) {
        try {
            // Get all participants
            $query = "
                SELECT user_id
                FROM conversation_participants
                WHERE conversation_id = :conversationId
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['conversationId' => $conversationId]);
            
            $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Create read status entries
            foreach ($participants as $participant) {
                $userId = $participant['user_id'];
                $isRead = ($userId == $senderId) ? 1 : 0;
                $readAt = ($userId == $senderId) ? 'NOW()' : 'NULL';
                
                $query = "
                    INSERT INTO chat_read_status (message_id, user_id, is_read, read_at)
                    VALUES (:messageId, :userId, :isRead, " . ($isRead ? 'NOW()' : 'NULL') . ")
                ";
                
                $stmt = $this->db->prepare($query);
                $stmt->execute([
                    'messageId' => $messageId,
                    'userId' => $userId,
                    'isRead' => $isRead
                ]);
            }
            
            return true;
        } catch (PDOException $e) {
            // Log error but don't stop execution
            error_log('Error creating read status entries: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get unread messages count for a user
     * @param int $userId
     * @return array
     */
    public function getUnreadMessagesCount($userId) {
        try {
            $query = "
                SELECT 
                    c.id as conversation_id,
                    c.name as conversation_name,
                    COUNT(crs.id) as unread_count
                FROM conversations c
                JOIN conversation_participants cp ON c.id = cp.conversation_id
                JOIN chat_messages cm ON c.id = cm.conversation_id
                JOIN chat_read_status crs ON cm.id = crs.message_id
                WHERE cp.user_id = :userId
                AND crs.user_id = :userId
                AND crs.is_read = 0
                GROUP BY c.id, c.name
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute(['userId' => $userId]);
            
            $conversationCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $totalCount = array_sum(array_column($conversationCounts, 'unread_count'));
            
            return [
                'success' => true, 
                'data' => [
                    'total_unread' => $totalCount,
                    'conversations' => $conversationCounts
                ]
            ];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to get unread message count', 'error' => $e->getMessage()];
        }
    }

    /**
     * Search users for creating a new conversation
     * @param string $searchTerm
     * @param int $currentUserId
     * @return array
     */
    public function searchUsers($searchTerm, $currentUserId) {
        try {
            $query = "
                SELECT 
                    id, 
                    full_name, 
                    email, 
                    profile_picture, 
                    role
                FROM users
                WHERE id != :currentUserId
                AND (full_name LIKE :searchTerm OR email LIKE :searchTerm)
                AND status = 'active'
                LIMIT 20
            ";
            
            $stmt = $this->db->prepare($query);
            $searchParam = '%' . $searchTerm . '%';
            $stmt->execute([
                'currentUserId' => $currentUserId,
                'searchTerm' => $searchParam
            ]);
            
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return ['success' => true, 'data' => $users];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Failed to search users', 'error' => $e->getMessage()];
        }
    }
}
?>