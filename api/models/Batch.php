<?php
class Batch {
    private $conn;
    private $table_name = "batches";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllBatches() {
        try {
            $query = "SELECT b.*, 
                     u.full_name as teacher_name,
                     COUNT(bs.student_id) as student_count
                     FROM " . $this->table_name . " b
                     LEFT JOIN users u ON b.teacher_id = u.id
                     LEFT JOIN batch_students bs ON b.id = bs.batch_id
                     WHERE b.status != 'completed'
                     GROUP BY b.id
                     ORDER BY b.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            throw new Exception("Error fetching batches: " . $e->getMessage());
        }
    }
}
?>
