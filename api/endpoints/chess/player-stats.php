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
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Get player stats
    $query = "SELECT * FROM chess_player_stats WHERE user_id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $user['id']);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        // Create default stats if not found
        $stats = [
            "user_id" => $user['id'],
            "games_played" => 0,
            "games_won" => 0,
            "games_lost" => 0,
            "games_drawn" => 0,
            "rating" => 1200
        ];
        
        // Insert default stats
        $insert_query = "INSERT INTO chess_player_stats 
                       (user_id, games_played, games_won, games_lost, games_drawn, rating) 
                       VALUES (?, 0, 0, 0, 0, 1200)";
        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->bindParam(1, $user['id']);
        $insert_stmt->execute();
    }
    
    // Calculate win percentage
    $win_percentage = $stats['games_played'] > 0 
        ? round(($stats['games_won'] / $stats['games_played']) * 100, 1) 
        : 0;
    
    $stats['win_percentage'] = $win_percentage;
    
    // Get recent games (last 5)
    $recent_games_query = "SELECT g.*, 
                         u1.full_name as white_player_name, 
                         u2.full_name as black_player_name,
                         CASE 
                            WHEN g.white_player_id = ? AND g.result = '1-0' THEN 'win'
                            WHEN g.black_player_id = ? AND g.result = '0-1' THEN 'win'
                            WHEN g.result = '1/2-1/2' THEN 'draw'
                            WHEN g.status = 'completed' THEN 'loss'
                            ELSE g.status
                         END as outcome
                         FROM chess_games g
                         JOIN users u1 ON g.white_player_id = u1.id
                         JOIN users u2 ON g.black_player_id = u2.id
                         WHERE (g.white_player_id = ? OR g.black_player_id = ?)
                         ORDER BY g.last_move_at DESC
                         LIMIT 5";
    
    $recent_stmt = $db->prepare($recent_games_query);
    $recent_stmt->bindParam(1, $user['id']);
    $recent_stmt->bindParam(2, $user['id']);
    $recent_stmt->bindParam(3, $user['id']);
    $recent_stmt->bindParam(4, $user['id']);
    $recent_stmt->execute();
    
    $recent_games = [];
    
    while($row = $recent_stmt->fetch(PDO::FETCH_ASSOC)) {
        $is_white = $row['white_player_id'] == $user['id'];
        $opponent_name = $is_white ? $row['black_player_name'] : $row['white_player_name'];
        
        $recent_games[] = [
            "id" => $row['id'],
            "opponent" => $opponent_name,
            "outcome" => $row['outcome'],
            "date" => $row['last_move_at'],
            "color" => $is_white ? 'white' : 'black'
        ];
    }
    
    $response = [
        "success" => true,
        "stats" => $stats,
        "recent_games" => $recent_games
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve player stats",
        "error" => $e->getMessage()
    ]);
}
?>
