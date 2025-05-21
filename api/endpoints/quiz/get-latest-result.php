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
    
    if (!isset($_GET['quiz_id'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing quiz ID"
        ]);
        exit;
    }
    
    $quiz_id = $_GET['quiz_id'];
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);

    $result = $quiz->getLatestResult($user['id'], $quiz_id);
    
    if (!$result) {
        http_response_code(404);
        echo json_encode([
            "message" => "No quiz results found"
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching quiz result",
        "error" => $e->getMessage()
    ]);
}
?>
