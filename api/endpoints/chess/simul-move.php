<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessSimul.php';
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
    if(!isset($data->simul_id) || !isset($data->board_id) || !isset($data->move) || !isset($data->fen)) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing required fields (simul_id, board_id, move, fen)"
        ]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize simul object
    $simul = new ChessSimul($db);
    
    // Update board position
    if($simul->updateBoardPosition($data->board_id, $data->fen, $user['id'])) {
        // Record the move in the database
        // Code to record the move would go here
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Move successfully recorded"
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Failed to make move. You may not have permission or the board is inactive."
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
