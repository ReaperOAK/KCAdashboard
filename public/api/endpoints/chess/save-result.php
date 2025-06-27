<?php
// Required headers
require_once '../../config/cors.php';

// Include database and object files
require_once '../../config/Database.php';
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
    if(!isset($data->game_id) || !isset($data->result)) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing required fields: game_id, result"
        ]);
        exit;
    }
    
    // Validate result format
    $validResults = ['1-0', '0-1', '1/2-1/2'];
    if(!in_array($data->result, $validResults)) {
        http_response_code(400);
        echo json_encode([
            "message" => "Invalid result format. Must be one of: " . implode(', ', $validResults)
        ]);
        exit;
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get the game details
    $query = "SELECT g.*, 
              w.full_name as white_player_name, w.id as white_id,
              b.full_name as black_player_name, b.id as black_id
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

    // Begin transaction
    $db->beginTransaction();

    try {
        // Determine reason for result
        $reason = isset($data->reason) ? $data->reason : 'agreement';
        
        // Update game with result
        $updateQuery = "UPDATE chess_games 
                       SET status = 'completed', result = :result, reason = :reason
                       WHERE id = :game_id";
        
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':result', $data->result);
        $updateStmt->bindParam(':reason', $reason);
        $updateStmt->bindParam(':game_id', $data->game_id);
        $updateStmt->execute();

        // Update player statistics
        // First determine winner and loser
        $whiteId = $game['white_id'];
        $blackId = $game['black_id'];
        
        $whiteWin = $data->result === '1-0';
        $blackWin = $data->result === '0-1';
        $draw = $data->result === '1/2-1/2';
        
        // Update white player stats
        $updateWhiteStats = "INSERT INTO chess_player_stats 
                           (user_id, games_played, games_won, games_lost, games_drawn)
                           VALUES (:user_id, 1, :won, :lost, :drawn)
                           ON DUPLICATE KEY UPDATE
                           games_played = games_played + 1,
                           games_won = games_won + :won,
                           games_lost = games_lost + :lost,
                           games_drawn = games_drawn + :drawn";
        
        $whiteWon = $whiteWin ? 1 : 0;
        $whiteLost = $blackWin ? 1 : 0;
        $whiteDrawn = $draw ? 1 : 0;
        
        $whiteStmt = $db->prepare($updateWhiteStats);
        $whiteStmt->bindParam(':user_id', $whiteId);
        $whiteStmt->bindParam(':won', $whiteWon);
        $whiteStmt->bindParam(':lost', $whiteLost);
        $whiteStmt->bindParam(':drawn', $whiteDrawn);
        $whiteStmt->execute();
        
        // Update black player stats
        $updateBlackStats = "INSERT INTO chess_player_stats 
                           (user_id, games_played, games_won, games_lost, games_drawn)
                           VALUES (:user_id, 1, :won, :lost, :drawn)
                           ON DUPLICATE KEY UPDATE
                           games_played = games_played + 1,
                           games_won = games_won + :won,
                           games_lost = games_lost + :lost,
                           games_drawn = games_drawn + :drawn";
        
        $blackWon = $blackWin ? 1 : 0;
        $blackLost = $whiteWin ? 1 : 0;
        $blackDrawn = $draw ? 1 : 0;
        
        $blackStmt = $db->prepare($updateBlackStats);
        $blackStmt->bindParam(':user_id', $blackId);
        $blackStmt->bindParam(':won', $blackWon);
        $blackStmt->bindParam(':lost', $blackLost);
        $blackStmt->bindParam(':drawn', $blackDrawn);
        $blackStmt->execute();

        // Create notifications for both players
        $notifyQuery = "INSERT INTO notifications 
                       (user_id, title, message, type, is_read, created_at) 
                       VALUES (:user_id, :title, :message, 'game', 0, NOW())";
        
        // Notification for white player
        $whiteTitle = $whiteWin ? "Game Won" : ($blackWin ? "Game Lost" : "Game Drawn");
        $whiteMessage = "Your game against " . $game['black_player_name'] . " has ended. Result: " . $data->result;
        
        $whiteNotifyStmt = $db->prepare($notifyQuery);
        $whiteNotifyStmt->bindParam(':user_id', $whiteId);
        $whiteNotifyStmt->bindParam(':title', $whiteTitle);
        $whiteNotifyStmt->bindParam(':message', $whiteMessage);
        $whiteNotifyStmt->execute();
        
        // Notification for black player
        $blackTitle = $blackWin ? "Game Won" : ($whiteWin ? "Game Lost" : "Game Drawn");
        $blackMessage = "Your game against " . $game['white_player_name'] . " has ended. Result: " . $data->result;
        
        $blackNotifyStmt = $db->prepare($notifyQuery);
        $blackNotifyStmt->bindParam(':user_id', $blackId);
        $blackNotifyStmt->bindParam(':title', $blackTitle);
        $blackNotifyStmt->bindParam(':message', $blackMessage);
        $blackNotifyStmt->execute();

        // Commit transaction
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Game result saved successfully",
            "game" => [
                "id" => $data->game_id,
                "result" => $data->result,
                "reason" => $reason,
                "status" => "completed"
            ]
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
        "message" => "Failed to save game result",
        "error" => $e->getMessage()
    ]);
}
?>
