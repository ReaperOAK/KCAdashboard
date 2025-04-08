<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->game_id) || !isset($data->result)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields (game_id, result)"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize game object
    $game = new ChessGame($db);
    $game->id = $data->game_id;
    
    // Verify user is part of this game
    $stmt = $game->getById($data->game_id, $user['id']);
    
    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Game not found or you don't have access"]);
        exit;
    }
    
    $game_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify game is active
    if($game_data['status'] != 'active') {
        http_response_code(400);
        echo json_encode(["message" => "Game is already completed or abandoned"]);
        exit;
    }
    
    // End the game with the provided result
    $result = $data->result;
    $reason = $data->reason ?? 'resignation';
    
    if($game->endGame($result, $reason)) {
        // Update player stats
        $white_id = $game_data['white_id'];
        $black_id = $game_data['black_id'];
        
        // Determine who won and update stats
        if($result == '1-0') {
            // White won
            updatePlayerStats($db, $white_id, 'win');
            updatePlayerStats($db, $black_id, 'loss');
        } else if($result == '0-1') {
            // Black won
            updatePlayerStats($db, $white_id, 'loss');
            updatePlayerStats($db, $black_id, 'win');
        } else if($result == '1/2-1/2') {
            // Draw
            updatePlayerStats($db, $white_id, 'draw');
            updatePlayerStats($db, $black_id, 'draw');
        }
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Game result recorded successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to record game result"
        ]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to record game result",
        "error" => $e->getMessage()
    ]);
}

// Helper function to update player stats
function updatePlayerStats($db, $user_id, $result) {
    try {
        // Check if player has stats record
        $check_query = "SELECT * FROM chess_player_stats WHERE user_id = ?";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(1, $user_id);
        $check_stmt->execute();
        
        if($check_stmt->rowCount() == 0) {
            // Create new stats record
            $insert_query = "INSERT INTO chess_player_stats 
                            (user_id, games_played, games_won, games_lost, games_drawn, rating) 
                            VALUES (?, 1, ?, ?, ?, 1200)";
            $insert_stmt = $db->prepare($insert_query);
            $insert_stmt->bindParam(1, $user_id);
            
            // Set initial values based on result
            $won = ($result == 'win') ? 1 : 0;
            $lost = ($result == 'loss') ? 1 : 0;
            $drawn = ($result == 'draw') ? 1 : 0;
            
            $insert_stmt->bindParam(2, $won);
            $insert_stmt->bindParam(3, $lost);
            $insert_stmt->bindParam(4, $drawn);
            $insert_stmt->execute();
        } else {
            // Update existing stats
            $update_query = "UPDATE chess_player_stats SET 
                            games_played = games_played + 1";
            
            if($result == 'win') {
                $update_query .= ", games_won = games_won + 1";
            } else if($result == 'loss') {
                $update_query .= ", games_lost = games_lost + 1";
            } else if($result == 'draw') {
                $update_query .= ", games_drawn = games_drawn + 1";
            }
            
            $update_query .= " WHERE user_id = ?";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(1, $user_id);
            $update_stmt->execute();
        }
        
        return true;
    } catch(Exception $e) {
        error_log("Error updating player stats: " . $e->getMessage());
        return false;
    }
}
?>
