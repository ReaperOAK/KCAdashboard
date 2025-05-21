<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Quiz.php';
require_once '../../middleware/auth.php';

try {
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
            "message" => "Only teachers can delete quizzes"
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
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);
    
    $success = $quiz->delete($quizId, $user['id']);
    
    http_response_code(200);
    echo json_encode([
        "message" => "Quiz deleted successfully"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error deleting quiz",
        "error" => $e->getMessage()
    ]);
}
?>
