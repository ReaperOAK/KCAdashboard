<?php
require_once '../../config/cors.php';

// Enable error display for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start output buffering to prevent partial JSON output
ob_start();

try {
    require_once '../../config/Database.php';
    require_once '../../middleware/auth.php';
    require_once '../../utils/Mailer.php'; // Make sure we use the right path
    require_once '../../services/NotificationService.php';

    // Get request body
    $data = json_decode(file_get_contents("php://input"), true);
    
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input: " . json_last_error_msg());
    }

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
        // Notify student using NotificationService
        $studentQuery = "SELECT id, email, full_name FROM users WHERE id = :student_id";
        $studentStmt = $db->prepare($studentQuery);
        $studentStmt->bindParam(':student_id', $studentId);
        $studentStmt->execute();
        $student = $studentStmt->fetch(PDO::FETCH_ASSOC);
        $notifSent = false;
        if ($student && !empty($student['id'])) {
            $notificationService = new NotificationService();
            $notifTitle = 'New Feedback from ' . $teacher['full_name'];
            $notifMsg = 'You have received new feedback from your teacher.';
            $notifSent = $notificationService->sendCustom(
                $student['id'],
                $notifTitle,
                $notifMsg,
                'feedback',
                false
            );
        }
        echo json_encode([
            "success" => true,
            "message" => "Feedback submitted successfully" . ($notifSent ? " and notification sent" : ""),
            "notification_sent" => $notifSent
        ]);
    } else {
        throw new Exception("Database error: Failed to insert feedback");
    }

} catch (Exception $e) {
    // Clean any output before sending error
    if (ob_get_length()) ob_clean();
    
    // Log the detailed error
    error_log("Feedback submission error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage(),
        "error_type" => get_class($e)
    ]);
}

// End output buffering
if (ob_get_length()) ob_end_flush();
?>
