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
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->opponent_id) || !isset($data->timeControl) || !isset($data->color)) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing required fields: opponent_id, timeControl, color"
        ]);
        exit;
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Validate opponent_id refers to a real user
    $query = "SELECT id, role, is_active FROM users WHERE id = :opponent_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':opponent_id', $data->opponent_id);
    $stmt->execute();

    if($stmt->rowCount() == 0) {
        http_response_code(400);
        echo json_encode(["message" => "Opponent not found"]);
        exit;
    }

    $opponent = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check if opponent is active
    if(!$opponent['is_active']) {
        http_response_code(400);
        echo json_encode(["message" => "Cannot challenge inactive user"]);
        exit;
    }

    // Check if user is challenging themselves
    if($user['id'] == $data->opponent_id) {
        http_response_code(400);
        echo json_encode(["message" => "Cannot challenge yourself"]);
        exit;
    }

    // Set expiration time (24 hours from now)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));

    // Set default position to starting position if not provided
    $position = isset($data->position) ? $data->position : 'start';

    // Insert challenge into database
    $query = "INSERT INTO chess_challenges 
              (challenger_id, recipient_id, time_control, color, position, status, created_at, expires_at) 
              VALUES (:challenger_id, :recipient_id, :time_control, :color, :position, 'pending', NOW(), :expires_at)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':challenger_id', $user['id']);
    $stmt->bindParam(':recipient_id', $data->opponent_id);
    $stmt->bindParam(':time_control', $data->timeControl);
    $stmt->bindParam(':color', $data->color);
    $stmt->bindParam(':position', $position);
    $stmt->bindParam(':expires_at', $expiresAt);

    if($stmt->execute()) {
        $challengeId = $db->lastInsertId();

        // Create a notification for the recipient
        $notifyQuery = "INSERT INTO notifications 
                        (user_id, title, message, type, is_read, created_at) 
                        VALUES (:user_id, 'New Chess Challenge', :message, 'challenge', 0, NOW())";
        
        $message = $user['full_name'] . ' has challenged you to a chess game.';
        
        $notifyStmt = $db->prepare($notifyQuery);
        $notifyStmt->bindParam(':user_id', $data->opponent_id);
        $notifyStmt->bindParam(':message', $message);
        $notifyStmt->execute();

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Challenge sent successfully",
            "challenge" => [
                "id" => $challengeId,
                "opponent" => [
                    "id" => $opponent['id'],
                    "role" => $opponent['role']
                ],
                "timeControl" => $data->timeControl,
                "color" => $data->color,
                "status" => "pending",
                "created_at" => date('Y-m-d H:i:s'),
                "expires_at" => $expiresAt
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Could not create challenge"
        ]);
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to process challenge request",
        "error" => $e->getMessage()
    ]);
}
?>
