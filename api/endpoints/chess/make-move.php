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
require_once '../../utils/ChessHelper.php';

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
        echo json_encode([
            "message" => "Missing required fields: game_id, move, fen"
        ]);
        exit;
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

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

    // Validate the move is legal 
    // (In a real implementation, you would validate the move using a chess library)
    // Using ChessHelper::isValidMove if available
    if(method_exists('ChessHelper', 'isValidMove')) {
        if(!ChessHelper::isValidMove($data->move, $game['position'])) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Invalid move"
            ]);
            exit;
        }
    }

    // Begin transaction
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

        // Record the move
        $moveQuery = "INSERT INTO chess_game_moves 
                     (game_id, move_number, move_san, position_after, made_by_id, created_at)
                     VALUES (:game_id, 
                            (SELECT COUNT(*) FROM chess_game_moves WHERE game_id = :game_id) + 1, 
                            :move_san, :position_after, :made_by_id, NOW())";
        
        // Extract move in SAN format from the move data
        // Handle different possible move data formats
        $moveSan = '';
        if (is_object($data->move)) {
            // If move is sent as an object with from/to properties
            $from = isset($data->move->from) ? $data->move->from : '';
            $to = isset($data->move->to) ? $data->move->to : '';
            $promotion = isset($data->move->promotion) ? $data->move->promotion : '';
            $moveSan = $from . $to . $promotion;
        } elseif (is_array($data->move)) {
            // If move is sent as an array (decoded JSON array)
            $from = isset($data->move['from']) ? $data->move['from'] : '';
            $to = isset($data->move['to']) ? $data->move['to'] : '';
            $promotion = isset($data->move['promotion']) ? $data->move['promotion'] : '';
            $moveSan = $from . $to . $promotion;
        } elseif (is_string($data->move)) {
            // If move is sent as a string
            $moveSan = $data->move;
        }
        
        // If we couldn't determine the move, use a placeholder to prevent DB errors
        if (empty($moveSan)) {
            $moveSan = 'unknown';
        }
        
        $moveStmt = $db->prepare($moveQuery);
        $moveStmt->bindParam(':game_id', $data->game_id);
        $moveStmt->bindParam(':move_san', $moveSan);
        $moveStmt->bindParam(':position_after', $data->fen);
        $moveStmt->bindParam(':made_by_id', $user['id']);
        $moveStmt->execute();

        // Create a notification for the opponent
        $opponentId = $isWhite ? $game['black_player_id'] : $game['white_player_id'];
        $opponentName = $isWhite ? $game['black_player_name'] : $game['white_player_name'];
        
        $notifyQuery = "INSERT INTO notifications 
                       (user_id, title, message, type, is_read, created_at) 
                       VALUES (:user_id, 'Your Move', :message, 'game', 0, NOW())";
        
        $message = $user['full_name'] . ' has made a move in your chess game.';
        
        $notifyStmt = $db->prepare($notifyQuery);
        $notifyStmt->bindParam(':user_id', $opponentId);
        $notifyStmt->bindParam(':message', $message);
        $notifyStmt->execute();

        // Commit transaction
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Move made successfully",
            "gameId" => $data->game_id,
            "position" => $data->fen,
            "moveNumber" => $moveStmt->rowCount() > 0 ? 1 : 0,
            "lastMoveAt" => date('Y-m-d H:i:s')
        ]);
    } catch(Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        throw $e;
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to process move: " . $e->getMessage(),
        "error" => $e->getMessage()
    ]);
}
?>
