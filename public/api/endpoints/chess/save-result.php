<?php
// Required headers
require_once '../../config/cors.php';

// Include database and object files
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

require_once '../../models/ChessStats.php';
require_once '../../models/Notification.php';
require_once '../../services/NotificationService.php';

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

        // Update player statistics and ratings using ChessStats model
        
        $whiteId = $game['white_id'];
        $blackId = $game['black_id'];

        $whiteStats = new ChessStats($db);
        $whiteStats->user_id = $whiteId;
        $blackStats = new ChessStats($db);
        $blackStats->user_id = $blackId;

        // Read current ratings
        $whiteStats->read();
        $blackStats->read();

        if ($data->result === '1-0') {
            $whiteUpdate = $whiteStats->updateFromGameResult('win', $blackStats->rating);
            $blackUpdate = $blackStats->updateFromGameResult('loss', $whiteStats->rating);
            error_log("[save-result] White stats after win: " . json_encode($whiteStats));
            error_log("[save-result] Black stats after loss: " . json_encode($blackStats));
            error_log("[save-result] White save result: " . var_export($whiteUpdate, true));
            error_log("[save-result] Black save result: " . var_export($blackUpdate, true));
        } elseif ($data->result === '0-1') {
            $whiteUpdate = $whiteStats->updateFromGameResult('loss', $blackStats->rating);
            $blackUpdate = $blackStats->updateFromGameResult('win', $whiteStats->rating);
            error_log("[save-result] White stats after loss: " . json_encode($whiteStats));
            error_log("[save-result] Black stats after win: " . json_encode($blackStats));
            error_log("[save-result] White save result: " . var_export($whiteUpdate, true));
            error_log("[save-result] Black save result: " . var_export($blackUpdate, true));
        } else {
            $whiteUpdate = $whiteStats->updateFromGameResult('draw', $blackStats->rating);
            $blackUpdate = $blackStats->updateFromGameResult('draw', $whiteStats->rating);
            error_log("[save-result] White stats after draw: " . json_encode($whiteStats));
            error_log("[save-result] Black stats after draw: " . json_encode($blackStats));
            error_log("[save-result] White save result: " . var_export($whiteUpdate, true));
            error_log("[save-result] Black save result: " . var_export($blackUpdate, true));
        }

        // Create notifications for both players using NotificationService
        $notificationService = new NotificationService();
        $whiteWin = $data->result === '1-0';
        $blackWin = $data->result === '0-1';
        $draw = $data->result === '1/2-1/2';
        $whiteTitle = $whiteWin ? "Game Won" : ($blackWin ? "Game Lost" : "Game Drawn");
        $whiteMessage = "Your game against " . $game['black_player_name'] . " has ended. Result: " . $data->result;
        $notificationService->sendCustom($whiteId, $whiteTitle, $whiteMessage, 'game');
        $blackTitle = $blackWin ? "Game Won" : ($whiteWin ? "Game Lost" : "Game Drawn");
        $blackMessage = "Your game against " . $game['white_player_name'] . " has ended. Result: " . $data->result;
        $notificationService->sendCustom($blackId, $blackTitle, $blackMessage, 'game');

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
