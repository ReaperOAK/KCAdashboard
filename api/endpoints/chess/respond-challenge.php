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
    if(!isset($data->challenge_id) || !isset($data->accept)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields (challenge_id, accept)"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if challenge exists and is pending
    $query = "SELECT c.*, u.full_name as challenger_name 
             FROM chess_challenges c
             JOIN users u ON c.challenger_id = u.id
             WHERE c.id = ? AND c.recipient_id = ? AND c.status = 'pending' AND c.expires_at > NOW()";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->challenge_id);
    $stmt->bindParam(2, $user['id']);
    $stmt->execute();
    
    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Challenge not found, expired, or not directed to you"]);
        exit;
    }
    
    $challenge = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Update challenge status
    $status = $data->accept ? 'accepted' : 'declined';
    $update_query = "UPDATE chess_challenges SET status = ? WHERE id = ?";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(1, $status);
    $update_stmt->bindParam(2, $data->challenge_id);
    $update_stmt->execute();
    
    // If accepted, create a new game
    if($data->accept) {
        // Initialize game object
        $game = new ChessGame($db);
        
        // Set game properties based on challenge
        if($challenge['color'] == 'white') {
            $game->white_player_id = $challenge['challenger_id'];
            $game->black_player_id = $user['id'];
        } else {
            $game->white_player_id = $user['id'];
            $game->black_player_id = $challenge['challenger_id'];
        }
        
        $game->position = $challenge['position'];
        $game->time_control = $challenge['time_control'];
        
        // Determine game type based on time control
        $time_parts = explode('+', $challenge['time_control']);
        $minutes = intval($time_parts[0]);
        
        if($minutes < 3) {
            $game->type = 'bullet';
        } else if($minutes < 10) {
            $game->type = 'blitz';
        } else if($minutes < 30) {
            $game->type = 'rapid';
        } else {
            $game->type = 'correspondence';
        }
        
        // Create the game
        if($game->create()) {
            // TODO: Notification to challenger should be sent here
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Challenge accepted and game created",
                "game" => [
                    "id" => $game->id,
                    "white_player_id" => $game->white_player_id,
                    "black_player_id" => $game->black_player_id,
                    "position" => $game->position,
                    "time_control" => $game->time_control,
                    "type" => $game->type
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Challenge accepted but failed to create game"]);
        }
    } else {
        // Challenge declined
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Challenge declined successfully"
        ]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to process challenge response",
        "error" => $e->getMessage()
    ]);
}
?>
