<?php
// chess/save-pgn.php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->game_id) || !isset($data->pgn)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing game_id or pgn"]);
        exit;
    }
    $gameId = intval($data->game_id);
    $pgn = $data->pgn;
    $database = new Database();
    $db = $database->getConnection();
    // Check if user is a player in the game
    $query = "SELECT white_player_id, black_player_id FROM chess_games WHERE id = :game_id";
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
    // Save PGN to chess_games table (add pgn column if not exists)
    $update = "UPDATE chess_games SET pgn = :pgn WHERE id = :game_id";
    $updateStmt = $db->prepare($update);
    $updateStmt->bindParam(':pgn', $pgn);
    $updateStmt->bindParam(':game_id', $gameId);
    $updateStmt->execute();
    echo json_encode(["success" => true, "message" => "PGN saved."]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to save PGN",
        "error" => $e->getMessage()
    ]);
}
?>
