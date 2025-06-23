<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    // Only students can enroll in classes
    if ($user['role'] !== 'student') {
        throw new Exception('Only students can enroll in classes');
    }

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->classroom_id)) {
        throw new Exception('Classroom ID is required');
    }

    $classroom_id = (int)$data->classroom_id;
    $student_id = $user['id'];

    $database = new Database();
    $db = $database->getConnection();

    // Start transaction
    $db->beginTransaction();

    // Check if classroom exists and is available for enrollment
    $query = "SELECT c.id, c.name, c.teacher_id, c.status,
                     COUNT(cs.student_id) as current_students
              FROM classrooms c
              LEFT JOIN classroom_students cs ON c.id = cs.classroom_id
              WHERE c.id = :classroom_id 
              AND c.status IN ('active', 'upcoming')
              GROUP BY c.id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    
    $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$classroom) {
        throw new Exception('Classroom not found or not available for enrollment');
    }    // Check if student is already enrolled
    $query = "SELECT classroom_id FROM classroom_students 
              WHERE classroom_id = :classroom_id AND student_id = :student_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        throw new Exception('You are already enrolled in this class');
    }

    // Check if classroom is full (assuming max 20 students)
    if ($classroom['current_students'] >= 20) {
        throw new Exception('This class is full');
    }

    // Enroll the student in the classroom
    $query = "INSERT INTO classroom_students (classroom_id, student_id, joined_at) 
              VALUES (:classroom_id, :student_id, NOW())";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->bindParam(':student_id', $student_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to enroll in class');
    }

    // If there's a corresponding batch, also enroll in the batch
    $batch_query = "SELECT b.id FROM batches b 
                    WHERE b.teacher_id = :teacher_id AND b.name = :classroom_name 
                    AND b.status IN ('active', 'inactive')
                    LIMIT 1";
    $batch_stmt = $db->prepare($batch_query);
    $batch_stmt->bindParam(':teacher_id', $classroom['teacher_id']);
    $batch_stmt->bindParam(':classroom_name', $classroom['name']);
    $batch_stmt->execute();
    
    $batch = $batch_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($batch) {        // Check if student is already in the batch
        $check_batch_query = "SELECT batch_id FROM batch_students 
                              WHERE batch_id = :batch_id AND student_id = :student_id";
        $check_batch_stmt = $db->prepare($check_batch_query);
        $check_batch_stmt->bindParam(':batch_id', $batch['id']);
        $check_batch_stmt->bindParam(':student_id', $student_id);
        $check_batch_stmt->execute();
        
        if ($check_batch_stmt->rowCount() == 0) {
            // Enroll in the corresponding batch
            $batch_enroll_query = "INSERT INTO batch_students (batch_id, student_id, joined_at, status) 
                                   VALUES (:batch_id, :student_id, NOW(), 'active')";
            $batch_enroll_stmt = $db->prepare($batch_enroll_query);
            $batch_enroll_stmt->bindParam(':batch_id', $batch['id']);
            $batch_enroll_stmt->bindParam(':student_id', $student_id);
            $batch_enroll_stmt->execute();
        }
    }

    // Commit transaction
    $db->commit();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Successfully enrolled in class"
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    if ($db && $db->inTransaction()) {
        $db->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Error enrolling in class",
        "error" => $e->getMessage()
    ]);
}
?>
