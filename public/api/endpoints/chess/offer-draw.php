<?php
// chess/offer-draw.php
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
    if (!isset($data->game_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing game_id"]);
        exit;
    }

    $gameId = intval($data->game_id);
    $database = new Database();
    $db = $database->getConnection();

    // Check if user is a player in the game and game is active
    $query = "SELECT g.*, 
              w.full_name as white_player_name, 
              b.full_name as black_player_name
              FROM chess_games g
              JOIN users w ON g.white_player_id = w.id
              JOIN users b ON g.black_player_id = b.id
              WHERE g.id = :game_id AND (g.white_player_id = :user_id OR g.black_player_id = :user_id)
              AND g.status = 'active'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':game_id', $gameId);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Game not found or not active"]);
        exit;
    }

    $game = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check if there's already a pending draw offer for this game
    $existingOfferQuery = "SELECT id, offered_by_id FROM chess_draw_offers 
                          WHERE game_id = :game_id AND status = 'pending' 
                          ORDER BY created_at DESC LIMIT 1";
    
    $existingStmt = $db->prepare($existingOfferQuery);
    $existingStmt->bindParam(':game_id', $gameId);
    $existingStmt->execute();

    if ($existingStmt->rowCount() > 0) {
        $existingOffer = $existingStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingOffer['offered_by_id'] == $user['id']) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "You have already offered a draw"]);
            exit;
        } else {
            // Opponent has already offered a draw, auto-accept it
            $updateQuery = "UPDATE chess_draw_offers 
                           SET status = 'accepted', responded_at = NOW() 
                           WHERE id = :offer_id";
            
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':offer_id', $existingOffer['id']);
            $updateStmt->execute();

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
            $whiteStats->user_id = $game['white_player_id'];
            $blackStats = new ChessStats($db);
            $blackStats->user_id = $game['black_player_id'];

            $whiteStats->read();
            $blackStats->read();

            $whiteStats->updateFromGameResult('draw', $blackStats->rating);
            $blackStats->updateFromGameResult('draw', $whiteStats->rating);

            // Send notifications
            $notificationService = new NotificationService();
            $whiteMessage = "Your game against " . $game['black_player_name'] . " has ended in a draw by mutual agreement.";
            $blackMessage = "Your game against " . $game['white_player_name'] . " has ended in a draw by mutual agreement.";
            
            $notificationService->sendCustom($game['white_player_id'], 'Game Drawn', $whiteMessage, 'game');
            $notificationService->sendCustom($game['black_player_id'], 'Game Drawn', $blackMessage, 'game');

            echo json_encode([
                "success" => true, 
                "message" => "Draw accepted! Game ended in a draw.",
                "game_ended" => true,
                "result" => "1/2-1/2"
            ]);
            exit;
        }
    }

    // Create new draw offer
    $offerQuery = "INSERT INTO chess_draw_offers (game_id, offered_by_id, expires_at) 
                   VALUES (:game_id, :user_id, DATE_ADD(NOW(), INTERVAL 5 MINUTE))";
    
    $offerStmt = $db->prepare($offerQuery);
    $offerStmt->bindParam(':game_id', $gameId);
    $offerStmt->bindParam(':user_id', $user['id']);
    $offerStmt->execute();

    // Send notification to opponent
    $opponentId = ($game['white_player_id'] == $user['id']) ? $game['black_player_id'] : $game['white_player_id'];
    $opponentName = ($game['white_player_id'] == $user['id']) ? $game['black_player_name'] : $game['white_player_name'];
    
    $notificationService = new NotificationService();
    $message = $user['full_name'] . " has offered a draw in your chess game.";
    $notificationService->sendCustom($opponentId, 'Draw Offered', $message, 'game');

    echo json_encode([
        "success" => true, 
        "message" => "Draw offer sent to " . $opponentName,
        "game_ended" => false
    ]);

} catch (Exception $e) {
    error_log("Error in offer-draw.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Internal server error"]);
}
?>
