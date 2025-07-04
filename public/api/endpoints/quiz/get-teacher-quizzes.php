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
            "message" => "Access denied"
        ]);
        exit;
    }
    
    $difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : null;
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);

    $quizzes = $quiz->getTeacherQuizzes($user['id'], $difficulty);

    http_response_code(200);
    echo json_encode([
        "quizzes" => $quizzes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching quizzes",
        "error" => $e->getMessage()
    ]);
}
?>
