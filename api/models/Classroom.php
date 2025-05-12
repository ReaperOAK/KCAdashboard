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
    public $meeting_link;
    public $platform;

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
     */
    public function getClassDetails($class_id, $user_id) {
        try {
            // First check if the user has access to this classroom
            $accessQuery = "SELECT c.*, 
                         u.full_name as teacher_name,
                         (SELECT COUNT(*) FROM classroom_students WHERE classroom_id = c.id) as student_count
                        FROM 
                         classrooms c
                        JOIN 
                         users u ON c.teacher_id = u.id
                        LEFT JOIN
                         classroom_students cs ON c.id = cs.classroom_id AND cs.student_id = :user_id
                        WHERE 
                         c.id = :class_id 
                         AND (c.teacher_id = :user_id OR cs.student_id = :user_id)";
            
            $stmt = $this->conn->prepare($accessQuery);
            $stmt->bindParam(":class_id", $class_id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                // Try to check if user is admin - admins can access any classroom
                $userQuery = "SELECT role FROM users WHERE id = :user_id";
                $userStmt = $this->conn->prepare($userQuery);
                $userStmt->bindParam(":user_id", $user_id);
                $userStmt->execute();
                
                $userRole = $userStmt->fetch(PDO::FETCH_ASSOC);
                if (!$userRole || $userRole['role'] !== 'admin') {
                    return false; // User doesn't have access
                }
                
                // If admin, fetch classroom details without access check
                $query = "SELECT c.*, 
                          u.full_name as teacher_name,
                          (SELECT COUNT(*) FROM classroom_students WHERE classroom_id = c.id) as student_count
                         FROM 
                          classrooms c
                         JOIN 
                          users u ON c.teacher_id = u.id
                         WHERE 
                          c.id = :class_id";
                          
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":class_id", $class_id);
                $stmt->execute();
            }
            
            $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$classroom) {
                return false;
            }
            
            // Get next session from batch_sessions instead of classroom_sessions
            // First check if this classroom is linked to a batch
            $batchQuery = "SELECT b.id FROM batches b 
                          WHERE b.teacher_id = :teacher_id 
                          LIMIT 1";
                          
            $batchStmt = $this->conn->prepare($batchQuery);
            $batchStmt->bindParam(":teacher_id", $classroom['teacher_id']);
            $batchStmt->execute();
            $batch = $batchStmt->fetch(PDO::FETCH_ASSOC);
            
            $nextSession = null;
            if ($batch) {
                $nextSessionQuery = "SELECT title, date_time 
                                   FROM batch_sessions 
                                   WHERE batch_id = :batch_id AND date_time > NOW() 
                                   ORDER BY date_time ASC
                                   LIMIT 1";
                                   
                $nextStmt = $this->conn->prepare($nextSessionQuery);
                $nextStmt->bindParam(":batch_id", $batch['id']);
                $nextStmt->execute();
                $nextSession = $nextStmt->fetch(PDO::FETCH_ASSOC);
            }
            
            // Format data for response
            $classDetails = [
                "id" => $classroom['id'],
                "name" => $classroom['name'],
                "description" => $classroom['description'],
                "schedule" => $classroom['schedule'],
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

    /**
     * Update video conference link for a batch
     * @param int $batch_id The batch ID
     * @param string $meeting_link The Google Meet or Zoom link
     * @param string $platform The platform (google_meet or zoom)
     * @return boolean True if successful, false otherwise
     */
    public function updateBatchMeetingLink($batch_id, $meeting_link, $platform = 'google_meet') {
        try {
            // Update the video meeting link in batches table
            // Check if the 'meeting_link' column exists, if not add it
            $this->ensureMeetingLinkColumn();
            
            $query = "UPDATE batches 
                     SET meeting_link = :meeting_link, 
                         video_platform = :platform,
                         updated_at = NOW() 
                     WHERE id = :batch_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':meeting_link', $meeting_link);
            $stmt->bindParam(':platform', $platform);
            $stmt->bindParam(':batch_id', $batch_id);
            
            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Database error in updateBatchMeetingLink: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get video conference link for a batch
     * @param int $batch_id The batch ID
     * @return array Meeting link data or null if not found
     */
    public function getBatchMeetingLink($batch_id) {
        try {
            $query = "SELECT meeting_link, video_platform 
                     FROM batches 
                     WHERE id = :batch_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batch_id);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                return [
                    'meeting_link' => $result['meeting_link'],
                    'platform' => $result['video_platform'] ?? 'google_meet'
                ];
            }
            return null;
        } catch (PDOException $e) {
            error_log("Database error in getBatchMeetingLink: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Create a new meeting session with the existing meeting link
     * @param array $data Meeting session data
     * @return array|boolean New session data if successful, false otherwise
     */
    public function createMeeting($data) {
        try {
            // First, get the batch meeting link if it exists
            $meetingInfo = $this->getBatchMeetingLink($data['batch_id']);
            $meetingLink = $meetingInfo ? $meetingInfo['meeting_link'] : null;
            $platform = $meetingInfo ? $meetingInfo['platform'] : 'google_meet';
            
            // If no link exists, use the provided one or return an error
            if (!$meetingLink && empty($data['meeting_link'])) {
                return ['success' => false, 'message' => 'No meeting link available for this batch'];
            }
            
            // Use the existing link from the batch if provided link is empty
            $finalLink = empty($data['meeting_link']) ? $meetingLink : $data['meeting_link'];
            
            $query = "INSERT INTO batch_sessions 
                     (batch_id, title, date_time, duration, type, meeting_link, online_meeting_id) 
                     VALUES 
                     (:batch_id, :title, :scheduled_time, :duration_minutes, 'online', :meeting_link, :meeting_id)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $data['batch_id']);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':scheduled_time', $data['scheduled_time']);
            $stmt->bindParam(':duration_minutes', $data['duration_minutes']);
            $stmt->bindParam(':meeting_link', $finalLink);
            
            // Generate a simple meeting ID for reference
            $meetingId = $platform . '_' . time();
            $stmt->bindParam(':meeting_id', $meetingId);
            
            if ($stmt->execute()) {
                $sessionId = $this->conn->lastInsertId();
                
                return [
                    'success' => true,
                    'id' => $sessionId,
                    'batch_id' => $data['batch_id'],
                    'title' => $data['title'],
                    'scheduled_time' => $data['scheduled_time'],
                    'duration_minutes' => $data['duration_minutes'],
                    'meeting_link' => $finalLink,
                    'platform' => $platform,
                    'meeting_id' => $meetingId
                ];
            }
            return ['success' => false, 'message' => 'Failed to create meeting session'];
        } catch (PDOException $e) {
            error_log("Database error in createMeeting: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Ensure the meeting_link column exists in the batches table
     */
    private function ensureMeetingLinkColumn() {
        try {
            // Check if meeting_link column exists
            $query = "SHOW COLUMNS FROM batches LIKE 'meeting_link'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                // Column doesn't exist, add it
                $alterQuery = "ALTER TABLE batches 
                              ADD COLUMN meeting_link VARCHAR(512) NULL AFTER status,
                              ADD COLUMN video_platform VARCHAR(50) DEFAULT 'google_meet' AFTER meeting_link";
                $this->conn->exec($alterQuery);
            }
            
            // Check if video_platform column exists
            $query = "SHOW COLUMNS FROM batches LIKE 'video_platform'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                // Column doesn't exist, add it
                $alterQuery = "ALTER TABLE batches 
                              ADD COLUMN video_platform VARCHAR(50) DEFAULT 'google_meet' AFTER meeting_link";
                $this->conn->exec($alterQuery);
            }
        } catch (PDOException $e) {
            error_log("Database error in ensureMeetingLinkColumn: " . $e->getMessage());
        }
    }
    
    /**
     * Check if a student is a participant in a batch
     * @param int $student_id The student ID
     * @param int $batch_id The batch ID
     * @return boolean True if student is in batch, false otherwise
     */
    public function isStudentInBatch($student_id, $batch_id) {
        $query = "SELECT 1 FROM batch_students 
                 WHERE student_id = :student_id 
                 AND batch_id = :batch_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':student_id', $student_id);
        $stmt->bindParam(':batch_id', $batch_id);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Check if a teacher teaches a student
     * @param int $teacher_id The teacher ID
     * @param int $student_id The student ID
     * @return boolean True if teacher teaches student, false otherwise
     */
    public function isTeacherForStudent($teacher_id, $student_id) {
        $query = "SELECT 1 FROM batches b
                 JOIN batch_students bs ON b.id = bs.batch_id
                 WHERE b.teacher_id = :teacher_id
                 AND bs.student_id = :student_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        $stmt->bindParam(':student_id', $student_id);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
    
    /**
     * Get meetings for a batch
     * @param int $batch_id The batch ID
     * @param boolean $includeCompleted Include completed meetings
     * @return array Array of meeting objects
     */
    public function getMeetingsByBatch($batch_id, $includeCompleted = false) {
        $timeCondition = $includeCompleted ? "" : " AND date_time >= NOW() - INTERVAL 1 HOUR";
        
        $query = "SELECT id, batch_id, title, date_time as scheduled_time, 
                 duration as duration_minutes, type, meeting_link, online_meeting_id
                 FROM batch_sessions
                 WHERE batch_id = :batch_id
                 AND type = 'online'
                 $timeCondition
                 ORDER BY date_time DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':batch_id', $batch_id);
        $stmt->execute();
        
        $meetings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $meetings[] = $row;
        }
        
        return $meetings;
    }
    
    /**
     * Get meetings by teacher
     * @param int $teacher_id The teacher ID
     * @param boolean $includeCompleted Include completed meetings
     * @return array Array of meeting objects
     */
    public function getMeetingsByTeacher($teacher_id, $includeCompleted = false) {
        $timeCondition = $includeCompleted ? "" : " AND bs.date_time >= NOW() - INTERVAL 1 HOUR";
        
        $query = "SELECT bs.id, bs.batch_id, bs.title, bs.date_time as scheduled_time, 
                 bs.duration as duration_minutes, bs.type, bs.meeting_link, bs.online_meeting_id,
                 b.teacher_id
                 FROM batch_sessions bs
                 JOIN batches b ON bs.batch_id = b.id
                 WHERE b.teacher_id = :teacher_id
                 AND bs.type = 'online'
                 $timeCondition
                 ORDER BY bs.date_time DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        $stmt->execute();
        
        $meetings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $meetings[] = $row;
        }
        
        return $meetings;
    }
    
    /**
     * Get teacher details
     * @param int $teacher_id The teacher ID
     * @return array Teacher details
     */
    public function getTeacherDetails($teacher_id) {
        $query = "SELECT id, full_name, email, profile_picture
                 FROM users
                 WHERE id = :teacher_id";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get batch details
     * @param int $batch_id The batch ID
     * @return array Batch details
     */
    public function getBatchDetails($batch_id) {
        $query = "SELECT id, name, description, level, status
                 FROM batches
                 WHERE id = :batch_id";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':batch_id', $batch_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get batch student IDs
     * @param int $batch_id The batch ID
     * @return array Array of student IDs
     */
    public function getBatchStudentIds($batch_id) {
        $query = "SELECT student_id
                 FROM batch_students
                 WHERE batch_id = :batch_id";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':batch_id', $batch_id);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
?>
