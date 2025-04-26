<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate token
    $userId = validateToken();
    $user = getAuthUser();

    // Check if student ID is provided
    if (!isset($_GET['student_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Student ID is required"]);
        exit;
    }

    $studentId = $_GET['student_id'];

    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();

    // Query depends on user role
    if ($user['role'] === 'teacher') {
        // Teachers can only see their own feedback
        $query = "SELECT 
                    sf.id,
                    sf.rating,
                    sf.comment,
                    sf.areas_of_improvement,
                    sf.strengths,
                    sf.created_at,
                    u.full_name AS teacher_name
                FROM 
                    student_feedback sf
                JOIN 
                    users u ON sf.teacher_id = u.id
                WHERE 
                    sf.student_id = :student_id
                    AND sf.teacher_id = :teacher_id
                ORDER BY 
                    sf.created_at DESC";
                    
        $stmt = $db->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->bindParam(':teacher_id', $userId);
    } 
    else if ($user['role'] === 'student') {
        // Students can only see their own feedback
        if ($userId != $studentId) {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Access denied. Students can only view their own feedback."]);
            exit;
        }
        
        $query = "SELECT 
                    sf.id,
                    sf.rating,
                    sf.comment,
                    sf.areas_of_improvement,
                    sf.strengths,
                    sf.created_at,
                    u.full_name AS teacher_name
                FROM 
                    student_feedback sf
                JOIN 
                    users u ON sf.teacher_id = u.id
                WHERE 
                    sf.student_id = :student_id
                ORDER BY 
                    sf.created_at DESC";
                    
        $stmt = $db->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
    }
    else if ($user['role'] === 'admin') {
        // Admins can see all feedback
        $query = "SELECT 
                    sf.id,
                    sf.rating,
                    sf.comment,
                    sf.areas_of_improvement,
                    sf.strengths,
                    sf.created_at,
                    u.full_name AS teacher_name
                FROM 
                    student_feedback sf
                JOIN 
                    users u ON sf.teacher_id = u.id
                WHERE 
                    sf.student_id = :student_id
                ORDER BY 
                    sf.created_at DESC";
                    
        $stmt = $db->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
    }
    else {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Access denied."]);
        exit;
    }

    $stmt->execute();
    
    $feedbackHistory = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $feedbackHistory[] = $row;
    }

    // Get student information
    $studentQuery = "SELECT full_name, email FROM users WHERE id = :student_id";
    $studentStmt = $db->prepare($studentQuery);
    $studentStmt->bindParam(':student_id', $studentId);
    $studentStmt->execute();
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    // Return feedback history with student info
    echo json_encode([
        "success" => true,
        "student" => $student,
        "feedback" => $feedbackHistory
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
