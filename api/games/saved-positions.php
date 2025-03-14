<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';
require_once '../models/Game.php';

try {
    // Authenticate user
    $user = verifyToken();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    // Optional limit parameter
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    
    $database = new Database();
    $db = $database->getConnection();
    
    $game = new Game($db);
    $positions = $game->getSavedPositions($user['id'], $limit);
    
    echo json_encode(array(
        "success" => true,
        "message" => "Successfully retrieved saved positions",
        "positions" => $positions
    ));
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => $e->getMessage()
    ));
}
?>
