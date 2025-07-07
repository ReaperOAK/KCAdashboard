<?php
// chess/cleanup-inactive-games.php
require_once '../../config/cors.php';
require_once '../../config/Database.php';

require_once '../../models/ChessGame.php';
require_once '../../models/Notification.php';
require_once '../../services/NotificationService.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    // 10 minutes inactivity
    $thresholdDate = date('Y-m-d H:i:s', strtotime('-10 minutes'));
    $query = "SELECT id, white_player_id, black_player_id FROM chess_games WHERE status = 'active' AND last_move_at < :threshold_date";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':threshold_date', $thresholdDate);
    $stmt->execute();
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $resignedGames = [];
    foreach ($games as $game) {
        // Find whose turn it was (from FEN in chess_games.position)
        $fenQuery = "SELECT position FROM chess_games WHERE id = :game_id";
        $fenStmt = $db->prepare($fenQuery);
        $fenStmt->bindParam(':game_id', $game['id']);
        $fenStmt->execute();
        $fenRow = $fenStmt->fetch(PDO::FETCH_ASSOC);
        $fen = $fenRow ? $fenRow['position'] : null;
        $winner = null;
        $loser = null;
        $result = null;
        if ($fen) {
            $parts = explode(' ', $fen);
            $turn = isset($parts[1]) ? $parts[1] : 'w';
            if ($turn === 'w') {
                $winner = $game['black_player_id'];
                $loser = $game['white_player_id'];
                $result = '0-1F'; // Black wins by forfeit
            } else {
                $winner = $game['white_player_id'];
                $loser = $game['black_player_id'];
                $result = '1-0F'; // White wins by forfeit
            }
        }
        // Mark as completed, set result and reason
        $update = "UPDATE chess_games SET status = 'completed', result = :result, reason = 'auto-resigned (inactivity)', ended_at = NOW() WHERE id = :game_id";
        $updateStmt = $db->prepare($update);
        $updateStmt->bindParam(':result', $result);
        $updateStmt->bindParam(':game_id', $game['id']);
        $updateStmt->execute();
        // Notify both players using NotificationService
        $notificationService = new NotificationService();
        $msgWinner = 'Victory! Your opponent was resigned due to 10 minutes of inactivity.';
        $msgLoser = 'You have been resigned from a game due to 10 minutes of inactivity.';
        if ($winner) {
            $notificationService->sendCustom($winner, 'Game Auto-Resigned', $msgWinner, 'game');
        }
        if ($loser) {
            $notificationService->sendCustom($loser, 'Game Auto-Resigned', $msgLoser, 'game');
        }
        $resignedGames[] = $game['id'];
    }
    echo json_encode(["success" => true, "resigned_games" => $resignedGames]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to clean up inactive games",
        "error" => $e->getMessage()
    ]);
}
?>
