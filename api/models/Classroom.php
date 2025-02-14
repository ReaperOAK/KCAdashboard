<?php
class Classroom {
    private $conn;
    private $table_name = "classrooms";

    public $id;
    public $name;
    public $description;
    public $teacher_id;
    public $schedule;
    public $created_at;
    public $status; // active, archived, upcoming

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getStudentClasses($student_id) {
        $query = "SELECT c.*, u.full_name as teacher_name 
                 FROM " . $this->table_name . " c
                 JOIN classroom_students cs ON c.id = cs.classroom_id
                 JOIN users u ON c.teacher_id = u.id
                 WHERE cs.student_id = :student_id
                 ORDER BY c.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getClassDetails($class_id, $student_id) {
        $query = "SELECT c.*, u.full_name as teacher_name,
                 (SELECT COUNT(*) FROM classroom_students WHERE classroom_id = c.id) as student_count
                 FROM " . $this->table_name . " c
                 JOIN users u ON c.teacher_id = u.id
                 WHERE c.id = :class_id
                 AND EXISTS (
                     SELECT 1 FROM classroom_students 
                     WHERE classroom_id = c.id 
                     AND student_id = :student_id
                 )";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":class_id", $class_id);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
