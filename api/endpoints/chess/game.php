<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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
    
    // Get game ID from URL parameter
    $game_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if(!$game_id) {
        http_response_code(400);
        echo json_encode(["message" => "Missing game ID parameter"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize game object
    $game = new ChessGame($db);
    
    // Get game details
    $stmt = $game->getById($game_id, $user['id']);
    
    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Game not found or you don't have access"]);
        exit;
    }
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Determine colors and opponent
    $is_white = ($row['white_id'] == $user['id']);
    $opponent = [
        'id' => $is_white ? $row['black_id'] : $row['white_id'],
        'name' => $is_white ? $row['black_player_name'] : $row['white_player_name'],
        'rating' => 1200 // Placeholder for rating
    ];
    
    // Determine if it's user's turn
    $your_turn = ($is_white && strpos($row['position'], ' w ') !== false) || 
                (!$is_white && strpos($row['position'], ' b ') !== false);
    
    $game_data = [
        "id" => $row['id'],
        "opponent" => $opponent,
        "status" => $row['status'],
        "lastMove" => $row['last_move_at'],
        "yourTurn" => $your_turn,
        "position" => $row['position'],
        "yourColor" => $is_white ? 'white' : 'black',
        "type" => $row['type'],
        "timeControl" => $row['time_control']
    ];
    
    // Add result if game is completed
    if($row['status'] == 'completed') {
        if($row['result'] == '1-0') {
            $game_data['result'] = $is_white ? 'win' : 'loss';
        } else if($row['result'] == '0-1') {
            $game_data['result'] = $is_white ? 'loss' : 'win';
        } else {
            $game_data['result'] = 'draw';
        }
        $game_data['reason'] = $row['reason'];
    }
    
    http_response_code(200);
    echo json_encode(["success" => true, "game" => $game_data]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve game details",
        "error" => $e->getMessage()
    ]);
}
?>
