<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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

    $classroom_id = isset($_GET['classroom_id']) ? $_GET['classroom_id'] : null;
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    $response = [
        'user' => $user,
        'classroom_id' => $classroom_id,
        'classroom_exists' => false,
        'user_enrolled' => false,
        'enrollment_details' => null,
        'classroom_details' => null
    ];
    
    if ($classroom_id) {
        // Check if classroom exists
        $query = "SELECT * FROM classrooms WHERE id = :classroom_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();
        $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response['classroom_exists'] = $classroom !== false;
        $response['classroom_details'] = $classroom;
        
        if ($classroom) {
            // Check if user is enrolled (for students)
            if ($user['role'] === 'student') {
                $enrollQuery = "SELECT * FROM classroom_students WHERE classroom_id = :classroom_id AND student_id = :user_id";
                $enrollStmt = $db->prepare($enrollQuery);
                $enrollStmt->bindParam(':classroom_id', $classroom_id);
                $enrollStmt->bindParam(':user_id', $user['id']);
                $enrollStmt->execute();
                $enrollment = $enrollStmt->fetch(PDO::FETCH_ASSOC);
                
                $response['user_enrolled'] = $enrollment !== false;
                $response['enrollment_details'] = $enrollment;
            } elseif ($user['role'] === 'teacher') {
                // Check if teacher owns this classroom
                $response['user_enrolled'] = ($classroom['teacher_id'] == $user['id']);
                $response['enrollment_details'] = [
                    'is_teacher' => true,
                    'teacher_id' => $classroom['teacher_id'],
                    'user_id' => $user['id']
                ];
            } elseif ($user['role'] === 'admin') {
                $response['user_enrolled'] = true;
                $response['enrollment_details'] = ['is_admin' => true];
            }
        }
        
        // Get all students in this classroom for reference
        $studentsQuery = "SELECT cs.*, u.full_name, u.email FROM classroom_students cs JOIN users u ON cs.student_id = u.id WHERE cs.classroom_id = :classroom_id";
        $studentsStmt = $db->prepare($studentsQuery);
        $studentsStmt->bindParam(':classroom_id', $classroom_id);
        $studentsStmt->execute();
        $response['all_students'] = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
