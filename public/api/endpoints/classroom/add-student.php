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

    // Only teachers and admins can add students to classrooms
    if (!in_array($user['role'], ['teacher', 'admin'])) {
        throw new Exception('Only teachers and admins can add students to classrooms');
    }

    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->classroom_id) || !isset($data->student_id)) {
        throw new Exception('Classroom ID and Student ID are required');
    }

    $classroom_id = (int)$data->classroom_id;
    $student_id = (int)$data->student_id;

    $database = new Database();
    $db = $database->getConnection();

    // Start transaction
    $db->beginTransaction();

    // Check if classroom exists and teacher has permission
    if ($user['role'] === 'teacher') {
        $query = "SELECT id, name, teacher_id FROM classrooms 
                  WHERE id = :classroom_id AND teacher_id = :teacher_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->bindParam(':teacher_id', $user['id']);
        $stmt->execute();
    } else {
        // Admin can add to any classroom
        $query = "SELECT id, name, teacher_id FROM classrooms WHERE id = :classroom_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();
    }
    
    $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$classroom) {
        throw new Exception('Classroom not found or you do not have permission to modify it');
    }

    // Check if student exists and is actually a student
    $student_query = "SELECT id, full_name, email FROM users 
                      WHERE id = :student_id AND role = 'student'";
    $student_stmt = $db->prepare($student_query);
    $student_stmt->bindParam(':student_id', $student_id);
    $student_stmt->execute();
    
    $student = $student_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student) {
        throw new Exception('Student not found');
    }    // Check if student is already enrolled
    $check_query = "SELECT classroom_id FROM classroom_students 
                    WHERE classroom_id = :classroom_id AND student_id = :student_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':classroom_id', $classroom_id);
    $check_stmt->bindParam(':student_id', $student_id);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        throw new Exception('Student is already enrolled in this classroom');
    }

    // Add the student to the classroom
    $insert_query = "INSERT INTO classroom_students (classroom_id, student_id, joined_at) 
                     VALUES (:classroom_id, :student_id, NOW())";
    $insert_stmt = $db->prepare($insert_query);
    $insert_stmt->bindParam(':classroom_id', $classroom_id);
    $insert_stmt->bindParam(':student_id', $student_id);
    
    if (!$insert_stmt->execute()) {
        throw new Exception('Failed to add student to classroom');
    }

    // Commit transaction
    $db->commit();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Student successfully added to classroom",
        "data" => [
            "classroom_id" => $classroom_id,
            "student_id" => $student_id,
            "student_name" => $student['full_name'],
            "classroom_name" => $classroom['name']
        ]
    ]);

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
