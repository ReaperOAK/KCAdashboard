<?php
class Classroom {
    // Database connection
    private $conn;

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

    /**
     * Get all classes in which a student is enrolled
     */
    public function getStudentClasses($student_id) {
        $query = "SELECT 
                    c.id, 
                    c.name, 
                    c.description, 
                    c.schedule,
                    c.status,
                    u.full_name as teacher_name
                  FROM 
                    classrooms c
                  JOIN 
                    classroom_students cs ON c.id = cs.classroom_id
                  JOIN 
                    users u ON c.teacher_id = u.id
                  WHERE 
                    cs.student_id = :student_id
                  ORDER BY
                    c.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->execute();
        
        $classes = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $classes[] = [
                "id" => $row['id'],
                "name" => $row['name'],
                "description" => $row['description'],
                "schedule" => $row['schedule'],
                "status" => $row['status'],
                "teacher_name" => $row['teacher_name']
            ];
        }
        
        return $classes;
    }
    
    /**
     * Get available classes that a student can join
     */
    public function getAvailableClasses($student_id) {
        $query = "SELECT 
                    c.id, 
                    c.name, 
                    c.description, 
                    c.schedule,
                    c.status,
                    u.full_name as teacher_name,
                    b.level,
                    (
                      SELECT COUNT(*) FROM classroom_students 
                      WHERE classroom_id = c.id
                    ) as enrolled_students,
                    b.max_students - (
                      SELECT COUNT(*) FROM classroom_students 
                      WHERE classroom_id = c.id
                    ) as available_slots
                  FROM 
                    classrooms c
                  JOIN 
                    users u ON c.teacher_id = u.id
                  JOIN
                    batches b ON c.batch_id = b.id
                  WHERE 
                    c.status IN ('active', 'upcoming')
                    AND c.id NOT IN (
                      SELECT classroom_id FROM classroom_students 
                      WHERE student_id = :student_id
                    )
                    AND (
                      SELECT COUNT(*) FROM classroom_students 
                      WHERE classroom_id = c.id
                    ) < b.max_students
                  ORDER BY
                    c.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->execute();
        
        $classes = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $classes[] = [
                "id" => $row['id'],
                "name" => $row['name'],
                "description" => $row['description'],
                "schedule" => $row['schedule'],
                "status" => $row['status'],
                "teacher_name" => $row['teacher_name'],
                "level" => $row['level'],
                "enrolled_students" => (int)$row['enrolled_students'],
                "available_slots" => (int)$row['available_slots']
            ];
        }
        
        return $classes;
    }
}
?>
