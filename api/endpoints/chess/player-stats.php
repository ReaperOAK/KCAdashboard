<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
    
    // Get target user_id from query parameters (defaults to current user)
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : $user['id'];
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get player stats
    $statsQuery = "SELECT * FROM chess_player_stats WHERE user_id = :user_id";
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->bindParam(':user_id', $userId);
    $statsStmt->execute();
    
    $stats = $statsStmt->rowCount() > 0 ? $statsStmt->fetch(PDO::FETCH_ASSOC) : [
        'user_id' => $userId,
        'games_played' => 0,
        'games_won' => 0,
        'games_lost' => 0,
        'games_drawn' => 0,
        'rating' => 1200
    ];
    
    // Get recent games
    $recentGamesQuery = "SELECT g.id, g.status, g.result, g.time_control, g.type, g.last_move_at,
                        CASE 
                            WHEN g.white_player_id = :user_id THEN 'white'
                            ELSE 'black'
                        END as player_color,
                        CASE 
                            WHEN g.white_player_id = :user_id THEN g.black_player_id
                            ELSE g.white_player_id
                        END as opponent_id,
                        CASE 
                            WHEN g.white_player_id = :user_id THEN w2.full_name
                            ELSE w1.full_name
                        END as opponent_name
                        FROM chess_games g
                        JOIN users w1 ON g.white_player_id = w1.id
                        JOIN users w2 ON g.black_player_id = w2.id
                        WHERE (g.white_player_id = :user_id OR g.black_player_id = :user_id)
                        ORDER BY g.last_move_at DESC
                        LIMIT 5";
    
    $recentGamesStmt = $db->prepare($recentGamesQuery);
    $recentGamesStmt->bindParam(':user_id', $userId);
    $recentGamesStmt->execute();
    
    $recentGames = [];
    while($row = $recentGamesStmt->fetch(PDO::FETCH_ASSOC)) {
        // Determine result from player's perspective
        $playerResult = null;
        if($row['status'] === 'completed') {
            if($row['result'] === '1-0') {
                $playerResult = $row['player_color'] === 'white' ? 'win' : 'loss';
            } else if($row['result'] === '0-1') {
                $playerResult = $row['player_color'] === 'black' ? 'win' : 'loss';
            } else {
                $playerResult = 'draw';
            }
        }
        
        $recentGames[] = [
            'id' => $row['id'],
            'status' => $row['status'],
            'playerColor' => $row['player_color'],
            'opponentId' => $row['opponent_id'],
            'opponentName' => $row['opponent_name'],
            'result' => $playerResult,
            'timeControl' => $row['time_control'],
            'type' => $row['type'],
            'lastMoveAt' => $row['last_move_at']
        ];
    }
    
    // Get ongoing challenges
    $challengesQuery = "SELECT c.id, c.time_control, c.color, c.status, c.created_at, c.expires_at,
                       CASE 
                           WHEN c.challenger_id = :user_id THEN 'outgoing'
                           ELSE 'incoming'
                       END as direction,
                       CASE 
                           WHEN c.challenger_id = :user_id THEN c.recipient_id
                           ELSE c.challenger_id
                       END as other_user_id,
                       CASE 
                           WHEN c.challenger_id = :user_id THEN u2.full_name
                           ELSE u1.full_name
                       END as other_user_name
                       FROM chess_challenges c
                       JOIN users u1 ON c.challenger_id = u1.id
                       JOIN users u2 ON c.recipient_id = u2.id
                       WHERE (c.challenger_id = :user_id OR c.recipient_id = :user_id)
                       AND c.status = 'pending'
                       AND c.expires_at > NOW()
                       ORDER BY c.created_at DESC";
    
    $challengesStmt = $db->prepare($challengesQuery);
    $challengesStmt->bindParam(':user_id', $userId);
    $challengesStmt->execute();
    
    $challenges = [];
    while($row = $challengesStmt->fetch(PDO::FETCH_ASSOC)) {
        $challenges[] = [
            'id' => $row['id'],
            'direction' => $row['direction'],
            'otherUserId' => $row['other_user_id'],
            'otherUserName' => $row['other_user_name'],
            'timeControl' => $row['time_control'],
            'color' => $row['color'],
            'status' => $row['status'],
            'createdAt' => $row['created_at'],
            'expiresAt' => $row['expires_at']
        ];
    }
    
    // Calculate win rate
    $winRate = $stats['games_played'] > 0 ? 
               round(($stats['games_won'] / $stats['games_played']) * 100, 1) : 0;
    
    // Format response
    $response = [
        'success' => true,
        'stats' => [
            'userId' => $stats['user_id'],
            'rating' => intval($stats['rating']),
            'gamesPlayed' => intval($stats['games_played']),
            'gamesWon' => intval($stats['games_won']),
            'gamesLost' => intval($stats['games_lost']),
            'gamesDrawn' => intval($stats['games_drawn']),
            'winRate' => $winRate
        ],
        'recentGames' => $recentGames,
        'challenges' => $challenges
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to get player stats",
        "error" => $e->getMessage()
    ]);
}
?>
