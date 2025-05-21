<?php
class Grading {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllStudents($teacher_id) {
        try {
            $query = "SELECT DISTINCT 
                        u.id, 
                        u.full_name as name, 
                        u.email,
                        c.name as batch_name,
                        (SELECT rating FROM student_feedback 
                         WHERE student_id = u.id 
                         ORDER BY created_at DESC LIMIT 1) as last_rating,
                        (SELECT created_at FROM student_feedback 
                         WHERE student_id = u.id 
                         ORDER BY created_at DESC LIMIT 1) as last_feedback_date
                     FROM users u
                     JOIN classroom_students cs ON u.id = cs.student_id
                     JOIN classrooms c ON cs.classroom_id = c.id
                     WHERE c.teacher_id = :teacher_id
                     AND u.role = 'student'
                     ORDER BY u.full_name";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":teacher_id", $teacher_id);
            $stmt->execute();

            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convert null ratings to 0 and format dates
            foreach ($students as &$student) {
                $student['last_rating'] = $student['last_rating'] ?? 0;
                $student['last_feedback_date'] = $student['last_feedback_date'] 
                    ? date('Y-m-d', strtotime($student['last_feedback_date'])) 
                    : null;
            }

            return $students;

        } catch (PDOException $e) {
            throw new Exception("Error fetching students: " . $e->getMessage());
        }
    }
}
?>
