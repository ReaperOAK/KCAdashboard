<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Prevent caching to ensure fresh data
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }
    
    // Get game ID from URL parameter
    $game_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if(!$game_id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing game ID parameter"]);
        exit;
    }
      // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Clean up expired games
    require_once '../../models/ChessGame.php';
    ChessGame::cleanupExpiredGames($db);
    
    // Direct SQL query for simplicity and reliability
    $query = "SELECT g.*, 
              w.id as white_id, w.full_name as white_player_name, 
              b.id as black_id, b.full_name as black_player_name
              FROM chess_games g
              JOIN users w ON g.white_player_id = w.id
              JOIN users b ON g.black_player_id = b.id
              WHERE g.id = :game_id AND (g.white_player_id = :user_id OR g.black_player_id = :user_id)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':game_id', $game_id);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Game not found or you don't have access"
        ]);
        exit;
    }
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Determine player colors and opponent
    $is_white = ($row['white_id'] == $user['id']);
    $opponent = [
        'id' => $is_white ? $row['black_id'] : $row['white_id'],
        'name' => $is_white ? $row['black_player_name'] : $row['white_player_name']
    ];
    
    // Determine if it's user's turn from FEN position
    $currentTurn = strpos($row['position'], ' w ') !== false ? 'white' : 'black';
    $your_turn = ($is_white && $currentTurn === 'white') || (!$is_white && $currentTurn === 'black');
    
    $game_data = [
        "id" => $row['id'],
        "opponent" => $opponent,
        "status" => $row['status'],
        "lastMove" => $row['last_move_at'],
        "yourTurn" => $your_turn,
        "position" => $row['position'] ?: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Default starting position if none
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
    error_log("Chess game fetch error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve game details: " . $e->getMessage()
    ]);
}
?>
