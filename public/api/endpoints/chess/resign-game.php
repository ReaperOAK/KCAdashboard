<?php
// chess/resign-game.php
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

    // Check if user is a player in the game
    $query = "SELECT white_player_id, black_player_id, status FROM chess_games WHERE id = :game_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':game_id', $gameId);
    $stmt->execute();
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Game not found"]);
        exit;
    }
    $game = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user['id'] != $game['white_player_id'] && $user['id'] != $game['black_player_id']) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Not a player in this game"]);
        exit;
    }
    // Mark game as resigned and completed
    $update = "UPDATE chess_games SET status = 'completed', result = :result, ended_at = NOW() WHERE id = :game_id";
    $result = ($user['id'] == $game['white_player_id']) ? '0-1' : '1-0'; // The resigning player loses
    $updateStmt = $db->prepare($update);
    $updateStmt->bindParam(':result', $result);
    $updateStmt->bindParam(':game_id', $gameId);
    $updateStmt->execute();

    // Optionally, clean up any related pending challenges
    $delChallenge = "DELETE FROM chess_challenges WHERE (challenger_id = :w OR recipient_id = :w OR challenger_id = :b OR recipient_id = :b) AND status = 'accepted' AND position = 'start' AND EXISTS (SELECT 1 FROM chess_games WHERE id = :game_id)";
    $delStmt = $db->prepare($delChallenge);
    $delStmt->bindParam(':w', $game['white_player_id']);
    $delStmt->bindParam(':b', $game['black_player_id']);
    $delStmt->bindParam(':game_id', $gameId);
    $delStmt->execute();

    // Notify both players using NotificationService
    $notificationService = new NotificationService();
    $msg = 'The game has been resigned and ended.';
    foreach ([$game['white_player_id'], $game['black_player_id']] as $uid) {
        $notificationService->sendCustom($uid, 'Game Resigned', $msg, 'game');
    }
    echo json_encode(["success" => true, "message" => "Game resigned and completed."]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to resign game",
        "error" => $e->getMessage()
    ]);
}
?>
