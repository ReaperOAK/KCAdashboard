<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Quiz.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);

    $difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : die();
    require_once '../../middleware/auth.php';
    $user = getAuthUser();
    $quizzes = $quiz->getByDifficulty($difficulty, $user);

    http_response_code(200);
    echo json_encode([
        "quizzes" => $quizzes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching quizzes by difficulty",
        "error" => $e->getMessage()
    ]);
}
?>
