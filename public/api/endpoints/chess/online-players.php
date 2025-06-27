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
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Find active/online users
    // For simplicity, we consider a user "online" if they've had any activity in the last 15 minutes
    // In a production environment, you might have a more sophisticated online status tracking
    
    $timeThreshold = date('Y-m-d H:i:s', strtotime('-15 minutes'));
    
    $query = "SELECT u.id, u.full_name, u.role, u.profile_picture,
              CASE WHEN EXISTS (
                SELECT 1 FROM auth_tokens 
                WHERE user_id = u.id AND expires_at > NOW() 
                AND created_at > :time_threshold
              ) THEN 'online' ELSE 'offline' END as status,
              CASE WHEN cp.rating IS NOT NULL THEN cp.rating ELSE 1200 END as rating
              FROM users u
              LEFT JOIN chess_player_stats cp ON u.id = cp.user_id
              WHERE u.is_active = 1 AND u.id != :user_id
              ORDER BY status DESC, u.full_name ASC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':time_threshold', $timeThreshold);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();

    $players = array();
    
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Check if there's a pending challenge
        $challengeQuery = "SELECT id, status FROM chess_challenges
                          WHERE (challenger_id = :user_id AND recipient_id = :player_id
                                OR challenger_id = :player_id AND recipient_id = :user_id)
                          AND status = 'pending'
                          AND expires_at > NOW()
                          ORDER BY created_at DESC
                          LIMIT 1";
        
        $challengeStmt = $db->prepare($challengeQuery);
        $challengeStmt->bindParam(':user_id', $user['id']);
        $challengeStmt->bindParam(':player_id', $row['id']);
        $challengeStmt->execute();
        
        $hasPendingChallenge = $challengeStmt->rowCount() > 0;
        $challengeDetails = $hasPendingChallenge ? $challengeStmt->fetch(PDO::FETCH_ASSOC) : null;
        
        // Check for active games with this player
        $gameQuery = "SELECT id FROM chess_games
                     WHERE ((white_player_id = :user_id AND black_player_id = :player_id)
                           OR (white_player_id = :player_id AND black_player_id = :user_id))
                     AND status = 'active'
                     LIMIT 1";
        
        $gameStmt = $db->prepare($gameQuery);
        $gameStmt->bindParam(':user_id', $user['id']);
        $gameStmt->bindParam(':player_id', $row['id']);
        $gameStmt->execute();
        
        $hasActiveGame = $gameStmt->rowCount() > 0;
        $activeGameId = $hasActiveGame ? $gameStmt->fetch(PDO::FETCH_ASSOC)['id'] : null;
        
        // Add player to list
        $player = array(
            "id" => $row['id'],
            "name" => $row['full_name'],
            "role" => $row['role'],
            "status" => $row['status'],
            "rating" => intval($row['rating']),
            "profile_picture" => $row['profile_picture'],
            "canChallenge" => !$hasPendingChallenge && !$hasActiveGame,
            "pendingChallenge" => $hasPendingChallenge ? [
                "id" => $challengeDetails['id'],
                "status" => $challengeDetails['status']
            ] : null,
            "activeGame" => $hasActiveGame ? $activeGameId : null
        );
        
        $players[] = $player;
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "players" => $players,
        "total" => count($players)
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to get online players",
        "error" => $e->getMessage()
    ]);
}
?>
