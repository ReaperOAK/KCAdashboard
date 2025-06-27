<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    $classroom_id = isset($_GET['classroom_id']) ? (int)$_GET['classroom_id'] : null;
    
    if (!$classroom_id) {
        throw new Exception('Classroom ID is required');
    }

    $database = new Database();
    $db = $database->getConnection();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Handle enrollment
        $student_id = $user['id'];

        // Start transaction
        $db->beginTransaction();

        // Check if classroom exists
        $query = "SELECT c.id, c.name, c.teacher_id, c.status FROM classrooms c WHERE c.id = :classroom_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();
        
        $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$classroom) {
            throw new Exception('Classroom not found');
        }

        // Check if student is already enrolled
        $check_query = "SELECT id FROM classroom_students 
                        WHERE classroom_id = :classroom_id AND student_id = :student_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':classroom_id', $classroom_id);
        $check_stmt->bindParam(':student_id', $student_id);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            throw new Exception('You are already enrolled in this classroom');
        }

        // Enroll the student
        $insert_query = "INSERT INTO classroom_students (classroom_id, student_id, joined_at) 
                         VALUES (:classroom_id, :student_id, NOW())";
        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->bindParam(':classroom_id', $classroom_id);
        $insert_stmt->bindParam(':student_id', $student_id);
        
        if (!$insert_stmt->execute()) {
            throw new Exception('Failed to enroll in classroom');
        }

        // Commit transaction
        $db->commit();

        echo json_encode([
            "success" => true,
            "message" => "Successfully enrolled in classroom: " . $classroom['name'],
            "classroom" => $classroom
        ]);
    } else {
        // GET request - show enrollment form or status
        $student_id = $user['id'];

        // Get classroom details
        $query = "SELECT c.*, u.full_name as teacher_name FROM classrooms c 
                  JOIN users u ON c.teacher_id = u.id 
                  WHERE c.id = :classroom_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();
        
        $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$classroom) {
            throw new Exception('Classroom not found');
        }

        // Check if student is already enrolled
        $check_query = "SELECT joined_at FROM classroom_students 
                        WHERE classroom_id = :classroom_id AND student_id = :student_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':classroom_id', $classroom_id);
        $check_stmt->bindParam(':student_id', $student_id);
        $check_stmt->execute();
        
        $enrollment = $check_stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "classroom" => $classroom,
            "user" => $user,
            "is_enrolled" => $enrollment !== false,
            "enrollment_date" => $enrollment ? $enrollment['joined_at'] : null,
            "enroll_url" => "POST to this same URL to enroll"
        ]);
    }

} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($db) && $db->inTransaction()) {
        $db->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
