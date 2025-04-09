<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessGame.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->game_id) || !isset($data->move) || !isset($data->fen)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields (game_id, move, fen)"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize game object
    $game = new ChessGame($db);
    
    // Check if user is part of the game
    $stmt = $game->getById($data->game_id, $user['id']);
    
    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Game not found or you don't have access"]);
        exit;
    }
    
    $game_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if game is active
    if($game_data['status'] != 'active') {
        http_response_code(400);
        echo json_encode(["message" => "Game is not active"]);
        exit;
    }
    
    // Check if it's user's turn
    $is_white = ($game_data['white_id'] == $user['id']);
    $is_white_turn = (strpos($game_data['position'], ' w ') !== false);
    
    if(($is_white && !$is_white_turn) || (!$is_white && $is_white_turn)) {
        http_response_code(400);
        echo json_encode(["message" => "It's not your turn"]);
        exit;
    }
    
    // Update game with new position
    $game->id = $data->game_id;
    $game->position = $data->fen;
    
    if($game->updatePosition()) {
        // Record move in history
        $move_number = floor(count(explode(' ', $game_data['position'])) / 2) + 1;
        $move_san = $data->move->san ?? "{$data->move->from}-{$data->move->to}";
        $made_by_id = $user['id'];
        
        $game->recordMove($move_number, $move_san, $data->fen, $made_by_id);
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Move recorded successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to make move"
        ]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to make move",
        "error" => $e->getMessage()
    ]);
}
?>
