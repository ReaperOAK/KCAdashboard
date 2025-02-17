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
}
?>
