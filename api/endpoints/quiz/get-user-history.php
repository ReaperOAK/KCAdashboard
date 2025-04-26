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
    
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);

    $historyData = $quiz->getUserHistory($user['id'], $filter);

    http_response_code(200);
    echo json_encode($historyData);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching quiz history",
        "error" => $e->getMessage()
    ]);
}
?>
