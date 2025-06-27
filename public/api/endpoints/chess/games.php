<?php
// Required headers
require_once '../../config/cors.php';

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessGame.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get status filter from URL parameter
    $status = isset($_GET['status']) ? $_GET['status'] : 'all';
      // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Clean up expired games first (similar to how challenges are cleaned up)
    ChessGame::cleanupExpiredGames($db);
    
    // Initialize game object
    $game = new ChessGame($db);
    
    // Get user's games
    $games = $game->getPlayerGames($user['id'], $status);
    
    http_response_code(200);
    echo json_encode(["success" => true, "games" => $games]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve games",
        "error" => $e->getMessage()
    ]);
}
?>
