<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Quiz.php';
require_once '../../middleware/auth.php';

try {
    // Get request data
    $data = json_decode(file_get_contents("php://input"));
      if (!$data || !isset($data->quiz_id) || !isset($data->time_taken)) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing required fields"
        ]);
        exit;
    }
    
    // Validate token
    $user = getAuthUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "message" => "Unauthorized"
        ]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);    // Process quiz submission
    $result = $quiz->submitQuiz(
        $user['id'], 
        $data->quiz_id,
        isset($data->answers) ? $data->answers : null,
        isset($data->chess_moves) ? $data->chess_moves : null,
        $data->time_taken
    );

    http_response_code(200);
    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error submitting quiz",
        "error" => $e->getMessage()
    ]);
}
?>
