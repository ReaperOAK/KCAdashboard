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
    
    // Check if request is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->name) || !isset($data->fen)) {
        throw new Exception('Name and FEN are required');
    }
    
    $positionData = [
        'name' => $data->name,
        'fen' => $data->fen,
        'notes' => isset($data->notes) ? $data->notes : ''
    ];
    
    $database = new Database();
    $db = $database->getConnection();
    
    $game = new Game($db);
    $result = $game->savePosition($user['id'], $positionData);
    
    if ($result) {
        echo json_encode(array(
            "success" => true,
            "message" => "Position saved successfully",
            "id" => $result
        ));
    } else {
        throw new Exception('Failed to save position');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => $e->getMessage()
    ));
}
?>
