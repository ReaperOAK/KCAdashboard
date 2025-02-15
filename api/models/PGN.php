<?php
class PGN {
    private $conn;
    private $table_name = "pgn_files";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getTeacherPGNs($teacher_id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " 
                     WHERE teacher_id = :teacher_id 
                     ORDER BY created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":teacher_id", $teacher_id);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching PGNs: " . $e->getMessage());
        }
    }

    public function upload($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (title, description, category, pgn_content, file_path, is_public, teacher_id)
                    VALUES (:title, :description, :category, :pgn_content, :file_path, :is_public, :teacher_id)";

            $stmt = $this->conn->prepare($query);
            $stmt->execute($data);
            return true;
        } catch (PDOException $e) {
            throw new Exception("Error uploading PGN: " . $e->getMessage());
        }
    }
}
?>
