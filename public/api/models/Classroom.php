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
                    AND c.status IN ('active', 'upcoming')
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
     * Get all batches in which a student is enrolled (alternative method)
     */
    public function getStudentBatches($student_id) {
        $query = "SELECT 
                    b.id, 
                    b.name, 
                    b.description, 
                    b.schedule,
                    b.status,
                    b.level,
                    u.full_name as teacher_name
                  FROM 
                    batches b
                  JOIN 
                    batch_students bs ON b.id = bs.batch_id
                  JOIN 
                    users u ON b.teacher_id = u.id
                  WHERE 
                    bs.student_id = :student_id
                    AND bs.status = 'active'
                    AND b.status IN ('active', 'inactive')
                  ORDER BY
                    b.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->execute();
        
        $batches = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $batches[] = [
                "id" => $row['id'],
                "name" => $row['name'],
                "description" => $row['description'],
                "schedule" => $row['schedule'],
                "status" => $row['status'],
                "level" => $row['level'],
                "teacher_name" => $row['teacher_name']
            ];
        }
        
        return $batches;
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
                    (
                      SELECT COUNT(*) FROM classroom_students 
                      WHERE classroom_id = c.id
                    ) as enrolled_students,
                    (20 - (
                      SELECT COUNT(*) FROM classroom_students 
                      WHERE classroom_id = c.id
                    )) as available_slots
                  FROM 
                    classrooms c
                  JOIN 
                    users u ON c.teacher_id = u.id
                  WHERE 
                    c.status IN ('active', 'upcoming')
                    AND c.id NOT IN (
                      SELECT classroom_id FROM classroom_students 
                      WHERE student_id = :student_id
                    )
                    AND (
                      SELECT COUNT(*) FROM classroom_students 
                      WHERE classroom_id = c.id
                    ) < 20
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
                "level" => isset($row['level']) ? $row['level'] : 'All Levels',
                "enrolled_students" => (int)$row['enrolled_students'],
                "available_slots" => (int)$row['available_slots']
            ];
        }
        
        return $classes;
    }

    /**
     * Get detailed information about a specific classroom
     */    public function getClassDetails($class_id, $user_id) {
        try {
            // Check if this is a batch being accessed as a classroom
            // First try to get batch details
            $batchQuery = "SELECT b.*, 
                         u.full_name as teacher_name,
                         (SELECT COUNT(*) FROM batch_students WHERE batch_id = b.id AND status = 'active') as student_count
                        FROM 
                         batches b
                        JOIN 
                         users u ON b.teacher_id = u.id
                        LEFT JOIN
                         batch_students bs ON b.id = bs.batch_id AND bs.student_id = :user_id
                        WHERE 
                         b.id = :class_id 
                         AND (b.teacher_id = :user_id OR bs.student_id = :user_id)";
            
            $stmt = $this->conn->prepare($batchQuery);
            $stmt->bindParam(":class_id", $class_id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$classroom) {
                // Check if user is admin and can access any batch
                $userQuery = "SELECT role FROM users WHERE id = :user_id";
                $userStmt = $this->conn->prepare($userQuery);
                $userStmt->bindParam(":user_id", $user_id);
                $userStmt->execute();
                
                $userRole = $userStmt->fetch(PDO::FETCH_ASSOC);
                if ($userRole && $userRole['role'] === 'admin') {
                    // Admin can access any batch
                    $adminQuery = "SELECT b.*, 
                                  u.full_name as teacher_name,
                                  (SELECT COUNT(*) FROM batch_students WHERE batch_id = b.id AND status = 'active') as student_count
                                 FROM 
                                  batches b
                                 JOIN 
                                  users u ON b.teacher_id = u.id
                                 WHERE 
                                  b.id = :class_id";
                                  
                    $stmt = $this->conn->prepare($adminQuery);
                    $stmt->bindParam(":class_id", $class_id);
                    $stmt->execute();
                    $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
                }
                
                if (!$classroom) {
                    return false; // User doesn't have access
                }
            }
            
            // Get next session for this batch
            $nextSessionQuery = "SELECT title, date_time 
                               FROM batch_sessions 
                               WHERE batch_id = :batch_id AND date_time > NOW() 
                               ORDER BY date_time ASC
                               LIMIT 1";
                               
            $nextStmt = $this->conn->prepare($nextSessionQuery);
            $nextStmt->bindParam(":batch_id", $class_id);
            $nextStmt->execute();
            $nextSession = $nextStmt->fetch(PDO::FETCH_ASSOC);
            
            // Format data for response (using batch data as classroom data)
            $classDetails = [
                "id" => $classroom['id'],
                "name" => $classroom['name'],
                "description" => $classroom['description'],
                "schedule" => $classroom['schedule'] ?? 'Not specified',
                "status" => $classroom['status'],
                "teacher_id" => $classroom['teacher_id'],
                "teacher_name" => $classroom['teacher_name'],
                "student_count" => (int)$classroom['student_count'],
                "next_session" => $nextSession ? $nextSession['title'] . ' on ' . date('M j, Y, g:i A', strtotime($nextSession['date_time'])) : null
            ];
            
            return $classDetails;
        } catch (PDOException $e) {
            // Log error and rethrow
            error_log("Database error in getClassDetails: " . $e->getMessage());
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
}
?>
