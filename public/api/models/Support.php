<?php
class Support {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllTickets() {
        try {
            $query = "SELECT 
                        t.*,
                        u.full_name as user_name,
                        au.full_name as assigned_to_name
                     FROM support_tickets t
                     JOIN users u ON t.user_id = u.id
                     LEFT JOIN users au ON t.assigned_to = au.id
                     ORDER BY 
                        FIELD(t.status, 'open', 'in_progress', 'resolved', 'closed'),
                        FIELD(t.priority, 'urgent', 'high', 'medium', 'low'),
                        t.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching tickets: " . $e->getMessage());
        }
    }

    public function updateTicketStatus($ticketId, $status) {
        try {
            $query = "UPDATE support_tickets 
                     SET status = :status,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            return $stmt->execute([
                ':status' => $status,
                ':id' => $ticketId
            ]);
        } catch (PDOException $e) {
            throw new Exception("Error updating ticket status: " . $e->getMessage());
        }
    }

    public function getAllFaqs() {
        try {
            $query = "SELECT * FROM faqs WHERE is_published = TRUE ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching FAQs: " . $e->getMessage());
        }
    }

    public function createFaq($data) {
        try {
            $query = "INSERT INTO faqs (question, answer, category, created_by) 
                     VALUES (:question, :answer, :category, :created_by)";

            $stmt = $this->conn->prepare($query);
            return $stmt->execute([
                ':question' => $data['question'],
                ':answer' => $data['answer'],
                ':category' => $data['category'],
                ':created_by' => $data['created_by']
            ]);
        } catch (PDOException $e) {
            throw new Exception("Error creating FAQ: " . $e->getMessage());
        }
    }

    public function deleteFaq($id) {
        try {
            $query = "DELETE FROM faqs WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([':id' => $id]);
        } catch (PDOException $e) {
            throw new Exception("Error deleting FAQ: " . $e->getMessage());
        }
    }

    public function getTicketById($ticketId) {
        try {
            $query = "SELECT 
                        t.*,
                        u.full_name as user_name,
                        au.full_name as assigned_to_name
                     FROM support_tickets t
                     JOIN users u ON t.user_id = u.id
                     LEFT JOIN users au ON t.assigned_to = au.id
                     WHERE t.id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([':id' => $ticketId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching ticket: " . $e->getMessage());
        }
    }

    public function getTicketReplies($ticketId) {
        try {
            $query = "SELECT 
                        tr.*,
                        u.full_name as user_name,
                        u.role as user_role
                     FROM ticket_responses tr
                     JOIN users u ON tr.user_id = u.id
                     WHERE tr.ticket_id = :ticket_id
                     ORDER BY tr.created_at ASC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([':ticket_id' => $ticketId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching ticket replies: " . $e->getMessage());
        }
    }

    public function addTicketReply($ticketId, $userId, $message) {
        try {
            $query = "INSERT INTO ticket_responses (ticket_id, user_id, message) 
                     VALUES (:ticket_id, :user_id, :message)";

            $stmt = $this->conn->prepare($query);
            $result = $stmt->execute([
                ':ticket_id' => $ticketId,
                ':user_id' => $userId,
                ':message' => $message
            ]);

            return $result ? $this->conn->lastInsertId() : false;
        } catch (PDOException $e) {
            throw new Exception("Error adding ticket reply: " . $e->getMessage());
        }
    }

    public function createTicket($userId, $title, $description, $priority = 'medium', $category = 'general') {
        try {
            $query = "INSERT INTO support_tickets (user_id, title, description, priority, category) 
                     VALUES (:user_id, :title, :description, :priority, :category)";

            $stmt = $this->conn->prepare($query);
            $result = $stmt->execute([
                ':user_id' => $userId,
                ':title' => $title,
                ':description' => $description,
                ':priority' => $priority,
                ':category' => $category
            ]);

            return $result ? $this->conn->lastInsertId() : false;
        } catch (PDOException $e) {
            throw new Exception("Error creating ticket: " . $e->getMessage());
        }
    }

    public function getMyTickets($userId) {
        try {
            $query = "SELECT 
                        t.*,
                        u.full_name as user_name,
                        au.full_name as assigned_to_name
                     FROM support_tickets t
                     JOIN users u ON t.user_id = u.id
                     LEFT JOIN users au ON t.assigned_to = au.id
                     WHERE t.user_id = :user_id
                     ORDER BY 
                        FIELD(t.status, 'open', 'in_progress', 'resolved', 'closed'),
                        FIELD(t.priority, 'urgent', 'high', 'medium', 'low'),
                        t.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([':user_id' => $userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching your tickets: " . $e->getMessage());
        }
    }
}
?>
