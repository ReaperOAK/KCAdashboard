<?php
class Tournament {
    private $conn;
    private $table_name = "tournaments";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT t.*, u.full_name as organizer_name,
                     (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as participant_count
                     FROM " . $this->table_name . " t
                     JOIN users u ON t.created_by = u.id
                     ORDER BY t.date_time ASC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching tournaments: " . $e->getMessage());
        }
    }

    public function getByStatus($status) {
        try {
            $query = "SELECT t.*, u.full_name as organizer_name,
                     (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as participant_count
                     FROM " . $this->table_name . " t
                     JOIN users u ON t.created_by = u.id
                     WHERE t.status = :status
                     ORDER BY t.date_time ASC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":status", $status);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching tournaments by status: " . $e->getMessage());
        }
    }
}
?>
