<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Quiz.php';
require_once '../../middleware/auth.php';

try {
    // Validate token
    $user = getAuthUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "message" => "Unauthorized"
        ]);
        exit;
    }
    
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing quiz ID"
        ]);
        exit;
    }
    
    $quiz_id = $_GET['id'];
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);

    $quizData = $quiz->getById($quiz_id, $user);
    
    if (!$quizData) {
        http_response_code(404);
        echo json_encode([
            "message" => "Quiz not found"
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        "quiz" => $quizData
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching quiz",
        "error" => $e->getMessage()
    ]);
}
?>
