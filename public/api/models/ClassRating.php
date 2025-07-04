<?php
// Model for storing class ratings by students
class ClassRating {
    public $id;
    public $class_id;
    public $student_id;
    public $rating; // integer (e.g., 1-5)
    public $comment; // optional
    public $created_at;

    public function __construct($data = []) {
        $this->id = $data['id'] ?? null;
        $this->class_id = $data['class_id'] ?? null;
        $this->student_id = $data['student_id'] ?? null;
        $this->rating = $data['rating'] ?? null;
        $this->comment = $data['comment'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
    }

    // Save a new rating
    public static function create($class_id, $student_id, $rating, $comment = null) {
        require_once __DIR__ . '/../config/Database.php';
        $db = (new Database())->getConnection();
        $query = "INSERT INTO class_ratings (class_id, student_id, rating, comment) VALUES (:class_id, :student_id, :rating, :comment)
                  ON DUPLICATE KEY UPDATE rating = :rating, comment = :comment, created_at = CURRENT_TIMESTAMP";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':class_id', $class_id);
        $stmt->bindParam(':student_id', $student_id);
        $stmt->bindParam(':rating', $rating);
        $stmt->bindParam(':comment', $comment);
        $stmt->execute();
    }

    // Get ratings for a class
    public static function getByClass($class_id) {
        require_once __DIR__ . '/../config/Database.php';
        $db = (new Database())->getConnection();
        $query = "SELECT * FROM class_ratings WHERE class_id = :class_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':class_id', $class_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Check if student attended and class ended
    public static function canRate($class_id, $student_id) {
        require_once __DIR__ . '/../config/Database.php';
        $db = (new Database())->getConnection();
        // Check attendance
        $attQuery = "SELECT a.id, s.date_time, s.duration FROM attendance a
                     JOIN batch_sessions s ON a.session_id = s.id
                     WHERE s.id = :class_id AND a.student_id = :student_id AND a.status = 'present'";
        $stmt = $db->prepare($attQuery);
        $stmt->bindParam(':class_id', $class_id);
        $stmt->bindParam(':student_id', $student_id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return false;
        // Check if class ended
        $endTime = strtotime($row['date_time']) + ((int)$row['duration'] * 60);
        return time() > $endTime;
    }
}
