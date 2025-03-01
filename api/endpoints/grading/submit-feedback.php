<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../utils/Mailer.php';

// Get request body
$data = json_decode(file_get_contents("php://input"), true);

try {
    // Validate token
    $teacherId = validateToken();
    $teacher = getAuthUser();

    // Check if user is a teacher
    if ($teacher['role'] !== 'teacher') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Access denied. Only teachers can submit feedback."]);
        exit;
    }

    // Validate required fields
    if (!isset($data['student_id']) || !isset($data['rating'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Student ID and rating are required"]);
        exit;
    }

    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();

    // Prepare statement to insert feedback
    $query = "INSERT INTO student_feedback 
                (student_id, teacher_id, rating, comment, areas_of_improvement, strengths, created_at) 
              VALUES 
                (:student_id, :teacher_id, :rating, :comment, :areas_of_improvement, :strengths, NOW())";

    $stmt = $db->prepare($query);
    
    // Sanitize and bind parameters
    $studentId = htmlspecialchars(strip_tags($data['student_id']));
    $rating = intval($data['rating']);
    $comment = isset($data['comment']) ? htmlspecialchars(strip_tags($data['comment'])) : '';
    $areasOfImprovement = isset($data['areas_of_improvement']) ? htmlspecialchars(strip_tags($data['areas_of_improvement'])) : '';
    $strengths = isset($data['strengths']) ? htmlspecialchars(strip_tags($data['strengths'])) : '';
    
    $stmt->bindParam(':student_id', $studentId);
    $stmt->bindParam(':teacher_id', $teacherId);
    $stmt->bindParam(':rating', $rating);
    $stmt->bindParam(':comment', $comment);
    $stmt->bindParam(':areas_of_improvement', $areasOfImprovement);
    $stmt->bindParam(':strengths', $strengths);
    
    // Execute query
    if ($stmt->execute()) {
        // Get student's email for notification
        $studentQuery = "SELECT email, full_name FROM users WHERE id = :student_id";
        $studentStmt = $db->prepare($studentQuery);
        $studentStmt->bindParam(':student_id', $studentId);
        $studentStmt->execute();
        
        $student = $studentStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($student) {
            // Send email notification to student using the existing Mailer class
            $mailer = new Mailer();
            $mailer->sendFeedbackNotification(
                $student['email'], 
                $student['full_name'], 
                $teacher['full_name'], 
                $rating, 
                $comment,
                $areasOfImprovement,
                $strengths
            );
        }
        
        echo json_encode([
            "success" => true,
            "message" => "Feedback submitted successfully"
        ]);
    } else {
        throw new Exception("Failed to submit feedback");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
