<?php
class Classroom {
    // Database connection
    private $conn;
    private $table = 'classrooms';

    // Class properties
    public $id;
    public $name;
    public $description;
    public $teacher_id;
    public $schedule;
    public $status;
    public $created_at;

    // Constructor
    public function __construct($db){
        $this->conn = $db;
    }

    /**
     * Get all classes taught by a specific teacher
     */
    public function getTeacherClasses($teacher_id) {
        $query = "SELECT 
                    b.id, 
                    b.name, 
                    b.description, 
                    b.level,
                    b.status,
                    COUNT(bs.student_id) as student_count
                  FROM 
                    batches b
                  LEFT JOIN 
                    batch_students bs ON b.id = bs.batch_id
                  WHERE 
                    b.teacher_id = :teacher_id
                  GROUP BY
                    b.id
                  ORDER BY
                    b.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":teacher_id", $teacher_id);
        $stmt->execute();
        
        $classes = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Format data
            $class = [
                "id" => $row['id'],
                "name" => $row['name'],
                "description" => $row['description'],
                "level" => $row['level'],
                "status" => $row['status'],
                "student_count" => (int)$row['student_count']
            ];
            
            // Get scheduled sessions for this batch
            $class['sessions'] = $this->getBatchSessions($row['id']);
            
            $classes[] = $class;
        }
        
        return $classes;
    }

    /**
     * Get scheduled sessions for a batch
     */
    private function getBatchSessions($batch_id) {
        $query = "SELECT 
                    id, title, date_time, duration, type, meeting_link
                  FROM 
                    batch_sessions 
                  WHERE 
                    batch_id = :batch_id AND
                    date_time >= CURDATE()
                  ORDER BY 
                    date_time ASC
                  LIMIT 5";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":batch_id", $batch_id);
        $stmt->execute();
        
        $sessions = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $sessions[] = [
                "id" => $row['id'],
                "title" => $row['title'],
                "date_time" => $row['date_time'],
                "duration" => $row['duration'],
                "type" => $row['type'],
                "meeting_link" => $row['meeting_link']
            ];
        }
        
        return $sessions;
    }

    /**
     * Get all students in a class/batch
     */
    public function getClassStudents($batch_id) {
        $query = "SELECT 
                    u.id, u.full_name, u.email, u.profile_picture,
                    bs.joined_at, bs.status
                  FROM 
                    batch_students bs
                  JOIN 
                    users u ON bs.student_id = u.id
                  WHERE 
                    bs.batch_id = :batch_id
                  ORDER BY 
                    u.full_name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":batch_id", $batch_id);
        $stmt->execute();
        
        $students = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $students[] = [
                "id" => $row['id'],
                "full_name" => $row['full_name'],
                "email" => $row['email'],
                "profile_picture" => $row['profile_picture'],
                "joined_at" => $row['joined_at'],
                "status" => $row['status']
            ];
        }
        
        return $students;
    }

    // Get classes for a student
    public function getStudentClasses($student_id) {
        try {
            // Updated query to use batches and batch_students tables instead of classrooms and enrollments
            $query = "SELECT 
                    b.id, 
                    b.name, 
                    b.description, 
                    b.status, 
                    CONCAT('Every ', b.day_of_week, ' at ', b.time) as schedule, 
                    CONCAT(u.full_name) as teacher_name 
                    FROM batches b
                    JOIN batch_students bs ON b.id = bs.batch_id
                    JOIN users u ON b.teacher_id = u.id
                    WHERE bs.student_id = :student_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':student_id', $student_id);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
    
    // Get classroom details by ID
    public function getClassroomDetails($id) {
        try {
            // Updated query to use batches table instead of classrooms
            $query = "SELECT 
                    b.id, 
                    b.name, 
                    b.description, 
                    b.status, 
                    CONCAT('Every ', b.day_of_week, ' at ', b.time) as schedule, 
                    u.full_name as teacher_name 
                    FROM batches b
                    JOIN users u ON b.teacher_id = u.id
                    WHERE b.id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
}
?>
