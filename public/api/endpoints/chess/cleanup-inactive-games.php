<?php
// chess/cleanup-inactive-games.php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/ChessGame.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    // 60 minutes inactivity
    $thresholdDate = date('Y-m-d H:i:s', strtotime('-60 minutes'));
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
        // Notify both players
        $notify = "INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES (:uid, 'Game Auto-Resigned', :msg, 'game', 0, NOW())";
        $msgWinner = 'Victory! Your opponent was resigned due to 60 minutes of inactivity.';
        $msgLoser = 'You have been resigned from a game due to 60 minutes of inactivity.';
        // Winner notification
        if ($winner) {
            $nstmt = $db->prepare($notify);
            $nstmt->bindParam(':uid', $winner);
            $nstmt->bindParam(':msg', $msgWinner);
            $nstmt->execute();
        }
        // Loser notification
        if ($loser) {
            $nstmt = $db->prepare($notify);
            $nstmt->bindParam(':uid', $loser);
            $nstmt->bindParam(':msg', $msgLoser);
            $nstmt->execute();
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
