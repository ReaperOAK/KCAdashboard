<?php
class Quiz {
    private $conn;
    private $table_name = "quizzes";

    public $id;
    public $title;
    public $description;
    public $difficulty;
    public $time_limit;
    public $created_by;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT q.*, u.full_name as creator_name 
                     FROM " . $this->table_name . " q
                     JOIN users u ON q.created_by = u.id
                     ORDER BY q.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching quizzes: " . $e->getMessage());
        }
    }

    public function getByDifficulty($difficulty) {
        try {
            $query = "SELECT q.*, u.full_name as creator_name 
                     FROM " . $this->table_name . " q
                     JOIN users u ON q.created_by = u.id
                     WHERE q.difficulty = :difficulty
                     ORDER BY q.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":difficulty", $difficulty);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching quizzes by difficulty: " . $e->getMessage());
        }
    }
}
?>
