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
    
    // Get status filter from URL parameter
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize game object
    $game = new ChessGame($db);
    
    // Get user's games
    $stmt = $game->getUserGames($user['id'], $status);
    $games = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Determine opponent and colors
        $is_white = ($row['white_player_id'] == $user['id']);
        $opponent = [
            'id' => $is_white ? $row['black_player_id'] : $row['white_player_id'],
            'name' => $is_white ? $row['black_player_name'] : $row['white_player_name'],
            'rating' => 1200 // Placeholder for rating
        ];
        
        // Determine if it's user's turn
        $position_obj = json_decode('{"position":"'.$row['position'].'"}');
        $your_turn = ($is_white && strpos($row['position'], ' w ') !== false) || 
                    (!$is_white && strpos($row['position'], ' b ') !== false);
        
        $game_item = [
            "id" => $row['id'],
            "opponent" => $opponent,
            "status" => $row['status'],
            "lastMove" => $row['last_move_at'],
            "yourTurn" => $your_turn,
            "position" => $row['position'],
            "yourColor" => $is_white ? 'white' : 'black',
            "type" => $row['type']
        ];
        
        // Add result if game is completed
        if($row['status'] == 'completed') {
            if($row['result'] == '1-0') {
                $game_item['result'] = $is_white ? 'win' : 'loss';
            } else if($row['result'] == '0-1') {
                $game_item['result'] = $is_white ? 'loss' : 'win';
            } else {
                $game_item['result'] = 'draw';
            }
        }
        
        $games[] = $game_item;
    }
    
    http_response_code(200);
    echo json_encode(["success" => true, "games" => $games]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve games",
        "error" => $e->getMessage()
    ]);
}
?>
