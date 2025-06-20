<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

// Simple error logging
error_log("Chess move request received");

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->game_id) || !isset($data->move) || !isset($data->fen)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields: game_id, move, fen"
        ]);
        exit;
    }    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Clean up expired games first
    require_once '../../models/ChessGame.php';
    ChessGame::cleanupExpiredGames($db);

    // Get the game details
    $query = "SELECT g.*, 
              w.full_name as white_player_name, 
              b.full_name as black_player_name
              FROM chess_games g
              JOIN users w ON g.white_player_id = w.id
              JOIN users b ON g.black_player_id = b.id
              WHERE g.id = :game_id AND (g.white_player_id = :user_id OR g.black_player_id = :user_id)
              AND g.status = 'active'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':game_id', $data->game_id);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();

    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Game not found, not active, or you are not a player"
        ]);
        exit;
    }

    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    // Determine player color and check if it's their turn
    $isWhite = ($game['white_player_id'] == $user['id']);
    $currentTurn = strpos($game['position'], ' w ') !== false ? 'white' : 'black';

    if(($isWhite && $currentTurn !== 'white') || (!$isWhite && $currentTurn !== 'black')) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Not your turn"
        ]);
        exit;
    }

    // Simple transaction to update the game
    $db->beginTransaction();

    try {
        // Update game with new position
        $updateQuery = "UPDATE chess_games 
                       SET position = :position, last_move_at = NOW()
                       WHERE id = :game_id";
        
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':position', $data->fen);
        $updateStmt->bindParam(':game_id', $data->game_id);
        $updateStmt->execute();

        // Extract move in simple format
        $moveSan = '';
        if (is_object($data->move) && isset($data->move->from) && isset($data->move->to)) {
            $moveSan = $data->move->from . $data->move->to;
        } elseif (is_string($data->move)) {
            $moveSan = $data->move;
        } else {
            $moveSan = 'unknown';
        }
        
        // Record the move in the moves table
        $moveNumber = 1;
        $countQuery = "SELECT COUNT(*) as count FROM chess_game_moves WHERE game_id = :game_id";
        $countStmt = $db->prepare($countQuery);
        $countStmt->bindParam(':game_id', $data->game_id);
        $countStmt->execute();
        $countRow = $countStmt->fetch(PDO::FETCH_ASSOC);
        $moveNumber = $countRow['count'] + 1;
        
        $moveQuery = "INSERT INTO chess_game_moves 
                     (game_id, move_number, move_san, position_after, made_by_id, created_at)
                     VALUES (:game_id, :move_number, :move_san, :position_after, :made_by_id, NOW())";
                     
        $moveStmt = $db->prepare($moveQuery);
        $moveStmt->bindParam(':game_id', $data->game_id);
        $moveStmt->bindParam(':move_number', $moveNumber);
        $moveStmt->bindParam(':move_san', $moveSan);
        $moveStmt->bindParam(':position_after', $data->fen);
        $moveStmt->bindParam(':made_by_id', $user['id']);
        $moveStmt->execute();

        // Commit transaction
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Move made successfully",
            "gameId" => $data->game_id,
            "position" => $data->fen,
            "lastMoveAt" => date('Y-m-d H:i:s')
        ]);
    } catch(Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        error_log("Chess move error: " . $e->getMessage());
        throw $e;
    }
} catch(Exception $e) {
    error_log("Chess move outer error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to process move: " . $e->getMessage()
    ]);
}
?>
