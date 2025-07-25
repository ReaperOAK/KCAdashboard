<?php
// chess/respond-draw.php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/Notification.php';
require_once '../../services/NotificationService.php';

try {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->game_id) || !isset($data->response)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing game_id or response"]);
        exit;
    }

    $gameId = intval($data->game_id);
    $response = $data->response; // 'accept' or 'decline'
    
    if (!in_array($response, ['accept', 'decline'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid response. Must be 'accept' or 'decline'"]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Get the pending draw offer and verify user can respond to it
    $query = "SELECT do.*, g.white_player_id, g.black_player_id,
              w.full_name as white_player_name, 
              b.full_name as black_player_name,
              u.full_name as offerer_name
              FROM chess_draw_offers do
              JOIN chess_games g ON do.game_id = g.id
              JOIN users w ON g.white_player_id = w.id
              JOIN users b ON g.black_player_id = b.id
              JOIN users u ON do.offered_by_id = u.id
              WHERE do.game_id = :game_id 
              AND do.status = 'pending'
              AND do.offered_by_id != :user_id
              AND (g.white_player_id = :user_id OR g.black_player_id = :user_id)
              AND g.status = 'active'
              ORDER BY do.created_at DESC 
              LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':game_id', $gameId);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "No pending draw offer found for this game"]);
        exit;
    }

    $offer = $stmt->fetch(PDO::FETCH_ASSOC);

    $db->beginTransaction();

    try {
        // Update the draw offer status
        $newStatus = ($response === 'accept') ? 'accepted' : 'declined';
        $updateOfferQuery = "UPDATE chess_draw_offers 
                            SET status = :status, responded_at = NOW() 
                            WHERE id = :offer_id";
        
        $updateStmt = $db->prepare($updateOfferQuery);
        $updateStmt->bindParam(':status', $newStatus);
        $updateStmt->bindParam(':offer_id', $offer['id']);
        $updateStmt->execute();

        if ($response === 'accept') {
            // End the game as a draw
            $gameUpdateQuery = "UPDATE chess_games 
                               SET status = 'completed', result = '1/2-1/2', reason = 'mutual agreement'
                               WHERE id = :game_id";
            
            $gameUpdateStmt = $db->prepare($gameUpdateQuery);
            $gameUpdateStmt->bindParam(':game_id', $gameId);
            $gameUpdateStmt->execute();

            // Update player statistics for draw
            require_once '../../models/ChessStats.php';
            
            $whiteStats = new ChessStats($db);
            $whiteStats->user_id = $offer['white_player_id'];
            $blackStats = new ChessStats($db);
            $blackStats->user_id = $offer['black_player_id'];

            $whiteStats->read();
            $blackStats->read();

            $whiteStats->updateFromGameResult('draw', $blackStats->rating);
            $blackStats->updateFromGameResult('draw', $whiteStats->rating);

            // Send notifications to both players
            $notificationService = new NotificationService();
            $whiteMessage = "Your game against " . $offer['black_player_name'] . " has ended in a draw by mutual agreement.";
            $blackMessage = "Your game against " . $offer['white_player_name'] . " has ended in a draw by mutual agreement.";
            
            $notificationService->sendCustom($offer['white_player_id'], 'Game Drawn', $whiteMessage, 'game');
            $notificationService->sendCustom($offer['black_player_id'], 'Game Drawn', $blackMessage, 'game');

            $message = "Draw accepted! Game ended in a draw.";
            $gameEnded = true;
        } else {
            // Send notification to the player who offered the draw
            $notificationService = new NotificationService();
            $message_text = $user['full_name'] . " has declined your draw offer.";
            $notificationService->sendCustom($offer['offered_by_id'], 'Draw Declined', $message_text, 'game');

            $message = "Draw offer declined.";
            $gameEnded = false;
        }

        $db->commit();

        echo json_encode([
            "success" => true, 
            "message" => $message,
            "game_ended" => $gameEnded,
            "result" => $gameEnded ? "1/2-1/2" : null
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    error_log("Error in respond-draw.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Internal server error"]);
}
?>
