<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessChallenge.php';
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

    // Clean up expired challenges first
    ChessChallenge::cleanupExpiredChallenges($db);
    
    // Create challenge object
    $challenge = new ChessChallenge($db);
    
    // Get pending challenges for the user
    $pendingChallenges = $challenge->getPendingChallenges($user['id']);
    
    // Additionally, get recently accepted outgoing challenges (for challenger auto-redirect)
    $query = "SELECT c.*, g.id as game_id, 
              u1.full_name as challenger_name, 
              u2.full_name as recipient_name,
              'outgoing' as direction
              FROM chess_challenges c
              JOIN users u1 ON c.challenger_id = u1.id
              JOIN users u2 ON c.recipient_id = u2.id
              JOIN chess_games g ON 
                  (c.challenger_id = g.white_player_id AND c.recipient_id = g.black_player_id)
                  OR (c.challenger_id = g.black_player_id AND c.recipient_id = g.white_player_id)
              WHERE c.challenger_id = :user_id 
              AND c.status = 'accepted'
              AND g.created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    $acceptedChallenges = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $acceptedChallenges[] = [
            'id' => $row['id'],
            'challenger' => [
                'id' => $row['challenger_id'],
                'name' => $row['challenger_name']
            ],
            'recipient' => [
                'id' => $row['recipient_id'],
                'name' => $row['recipient_name']
            ],
            'time_control' => $row['time_control'],
            'color' => $row['color'],
            'position' => $row['position'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'expires_at' => $row['expires_at'],
            'direction' => $row['direction'],
            'gameId' => $row['game_id']
        ];
    }
    
    // Combine both lists
    $challenges = array_merge($pendingChallenges, $acceptedChallenges);
    
    // Check if any challenges exist
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "challenges" => $challenges,
        "message" => count($challenges) > 0 ? "" : "No challenges found"
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve challenges",
        "error" => $e->getMessage()
    ]);
}
?>