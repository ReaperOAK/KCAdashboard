<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
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
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->opponent_id) || !isset($data->timeControl) || !isset($data->color)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields (opponent_id, timeControl, color)"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if opponent exists and is active
    $check_query = "SELECT id FROM users WHERE id = ? AND is_active = 1";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(1, $data->opponent_id);
    $check_stmt->execute();
    
    if($check_stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Opponent not found or inactive"]);
        exit;
    }
    
    // Check for existing pending challenges between these users
    $existing_query = "SELECT id FROM chess_challenges 
                     WHERE ((challenger_id = ? AND recipient_id = ?) 
                     OR (challenger_id = ? AND recipient_id = ?))
                     AND status = 'pending' AND expires_at > NOW()";
    
    $existing_stmt = $db->prepare($existing_query);
    $existing_stmt->bindParam(1, $user['id']);
    $existing_stmt->bindParam(2, $data->opponent_id);
    $existing_stmt->bindParam(3, $data->opponent_id);
    $existing_stmt->bindParam(4, $user['id']);
    $existing_stmt->execute();
    
    if($existing_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["message" => "A challenge is already pending between you and this player"]);
        exit;
    }
    
    // Determine color assignment
    $color = strtolower($data->color);
    if($color === 'random') {
        $color = (rand(0, 1) == 0) ? 'white' : 'black';
    }
    
    // Expiration time (30 minutes from now)
    $expires_at = date('Y-m-d H:i:s', strtotime('+30 minutes'));
    
    // Create challenge
    $query = "INSERT INTO chess_challenges 
            (challenger_id, recipient_id, time_control, color, position, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $db->prepare($query);
    
    // Position defaults to 'start' if not specified
    $position = isset($data->position) ? $data->position : 'start';
    
    $stmt->bindParam(1, $user['id']);
    $stmt->bindParam(2, $data->opponent_id);
    $stmt->bindParam(3, $data->timeControl);
    $stmt->bindParam(4, $color);
    $stmt->bindParam(5, $position);
    $stmt->bindParam(6, $expires_at);
    
    if($stmt->execute()) {
        $challenge_id = $db->lastInsertId();
        
        // TODO: Notification to recipient should be sent here
        // For example, email, push notification, or in-app notification
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Challenge sent successfully",
            "challenge" => [
                "id" => $challenge_id,
                "opponent_id" => $data->opponent_id,
                "color" => $color,
                "timeControl" => $data->timeControl,
                "position" => $position,
                "expires_at" => $expires_at
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Unable to create challenge"]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to create challenge",
        "error" => $e->getMessage()
    ]);
}
?>
