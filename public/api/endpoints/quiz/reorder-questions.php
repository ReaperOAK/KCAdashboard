<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Quiz.php';
require_once '../../middleware/auth.php';

try {
    // Only allow PUT requests for reordering
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        http_response_code(405);
        echo json_encode([
            "message" => "Method not allowed"
        ]);
        exit;
    }

    // Validate token and ensure user is a teacher
    $user = getAuthUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "message" => "Unauthorized"
        ]);
        exit;
    }
    
    if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            "message" => "Only teachers can reorder quiz questions"
        ]);
        exit;
    }
    
    // Get quiz ID from URL
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing quiz ID"
        ]);
        exit;
    }
    
    $quizId = $_GET['id'];
    
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['questions']) || !is_array($data['questions'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing questions array with new order"
        ]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify user has permission to edit this quiz
    $query = $user['role'] === 'admin' 
        ? "SELECT id FROM quizzes WHERE id = :quiz_id"
        : "SELECT id FROM quizzes WHERE id = :quiz_id AND created_by = :user_id";
        
    $stmt = $db->prepare($query);
    $stmt->bindParam(":quiz_id", $quizId);
    
    if ($user['role'] !== 'admin') {
        $stmt->bindParam(":user_id", $user['id']);
    }
    
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(403);
        echo json_encode([
            "message" => "Quiz not found or you don't have permission to edit it"
        ]);
        exit;
    }
    
    // Begin transaction for atomic update
    $db->beginTransaction();
    
    try {
        // Update the order_index for each question
        foreach ($data['questions'] as $index => $questionData) {
            if (!isset($questionData['id'])) {
                throw new Exception("Missing question ID in reorder data");
            }
            
            $questionId = $questionData['id'];
            $newOrderIndex = $index + 1; // 1-based indexing
            
            // Verify this question belongs to this quiz
            $query = "SELECT id FROM quiz_questions WHERE id = :question_id AND quiz_id = :quiz_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":question_id", $questionId);
            $stmt->bindParam(":quiz_id", $quizId);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                throw new Exception("Question ID {$questionId} does not belong to quiz {$quizId}");
            }
            
            // Update the order_index
            $query = "UPDATE quiz_questions SET order_index = :order_index WHERE id = :question_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":order_index", $newOrderIndex);
            $stmt->bindParam(":question_id", $questionId);
            $stmt->execute();
        }
        
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            "message" => "Question order updated successfully"
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error reordering questions",
        "error" => $e->getMessage()
    ]);
}
?>
