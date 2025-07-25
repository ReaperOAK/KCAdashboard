<?php
// chess/get-draw-offers.php
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

    $gameId = isset($_GET['game_id']) ? intval($_GET['game_id']) : 0;
    
    if (!$gameId) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing game_id parameter"]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();

    // Check if user is a player in the game
    $gameQuery = "SELECT white_player_id, black_player_id 
                  FROM chess_games 
                  WHERE id = :game_id 
                  AND (white_player_id = :user_id OR black_player_id = :user_id)
                  AND status = 'active'";
    
    $gameStmt = $db->prepare($gameQuery);
    $gameStmt->bindParam(':game_id', $gameId);
    $gameStmt->bindParam(':user_id', $user['id']);
    $gameStmt->execute();

    if ($gameStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Game not found or not accessible"]);
        exit;
    }

    // Get pending draw offers for this game
    $query = "SELECT do.*, u.full_name as offerer_name
              FROM chess_draw_offers do
              JOIN users u ON do.offered_by_id = u.id
              WHERE do.game_id = :game_id 
              AND do.status = 'pending'
              AND do.expires_at > NOW()
              ORDER BY do.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':game_id', $gameId);
    $stmt->execute();

    $offers = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $offers[] = [
            'id' => $row['id'],
            'offered_by_id' => $row['offered_by_id'],
            'offerer_name' => $row['offerer_name'],
            'created_at' => $row['created_at'],
            'expires_at' => $row['expires_at'],
            'can_respond' => $row['offered_by_id'] != $user['id'] // User can respond if they didn't make the offer
        ];
    }

    echo json_encode([
        "success" => true, 
        "offers" => $offers
    ]);

} catch (Exception $e) {
    error_log("Error in get-draw-offers.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Internal server error"]);
}
?>
