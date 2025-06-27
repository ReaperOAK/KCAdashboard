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
    if(!isset($data->challenge_id) || !isset($data->accept)) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing required fields: challenge_id, accept"
        ]);
        exit;
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get the challenge from database
    $query = "SELECT c.*, 
              u_challenger.full_name as challenger_name,
              u_recipient.full_name as recipient_name
              FROM chess_challenges c
              JOIN users u_challenger ON c.challenger_id = u_challenger.id
              JOIN users u_recipient ON c.recipient_id = u_recipient.id
              WHERE c.id = :challenge_id AND c.recipient_id = :user_id AND c.status = 'pending'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':challenge_id', $data->challenge_id);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();

    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Challenge not found or you are not the recipient"
        ]);
        exit;
    }

    $challenge = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if challenge has expired
    if(strtotime($challenge['expires_at']) < time()) {
        // Update challenge status to expired
        $updateQuery = "UPDATE chess_challenges SET status = 'expired' WHERE id = :challenge_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':challenge_id', $data->challenge_id);
        $updateStmt->execute();
        
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Challenge has expired"
        ]);
        exit;
    }

    // Begin transaction
    $db->beginTransaction();

    try {
        // Update challenge status
        $status = $data->accept ? 'accepted' : 'declined';
        $updateQuery = "UPDATE chess_challenges SET status = :status WHERE id = :challenge_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':status', $status);
        $updateStmt->bindParam(':challenge_id', $data->challenge_id);
        $updateStmt->execute();

        // If accepted, create a new game
        if($data->accept) {
            // Determine white and black players based on challenge color
            $whitePlayerId = $challenge['color'] === 'white' ? $challenge['challenger_id'] : $challenge['recipient_id'];
            $blackPlayerId = $challenge['color'] === 'white' ? $challenge['recipient_id'] : $challenge['challenger_id'];
            
            // Default starting position
            $position = $challenge['position'] === 'start' ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' : $challenge['position'];
            
            // Insert new game
            $gameQuery = "INSERT INTO chess_games 
                          (white_player_id, black_player_id, position, status, time_control, type, last_move_at, created_at) 
                          VALUES (:white_id, :black_id, :position, 'active', :time_control, 'correspondence', NOW(), NOW())";
            
            $gameStmt = $db->prepare($gameQuery);
            $gameStmt->bindParam(':white_id', $whitePlayerId);
            $gameStmt->bindParam(':black_id', $blackPlayerId);
            $gameStmt->bindParam(':position', $position);
            $gameStmt->bindParam(':time_control', $challenge['time_control']);
            $gameStmt->execute();
            
            $gameId = $db->lastInsertId();
            
            // Create a notification for the challenger
            $notifyQuery = "INSERT INTO notifications 
                           (user_id, title, message, type, is_read, created_at) 
                           VALUES (:user_id, 'Challenge Accepted', :message, 'game', 0, NOW())";
            
            $message = $challenge['recipient_name'] . ' has accepted your chess challenge.';
            
            $notifyStmt = $db->prepare($notifyQuery);
            $notifyStmt->bindParam(':user_id', $challenge['challenger_id']);
            $notifyStmt->bindParam(':message', $message);
            $notifyStmt->execute();
        } else {
            // If declined, just create a notification
            $notifyQuery = "INSERT INTO notifications 
                           (user_id, title, message, type, is_read, created_at) 
                           VALUES (:user_id, 'Challenge Declined', :message, 'game', 0, NOW())";
            
            $message = $challenge['recipient_name'] . ' has declined your chess challenge.';
            
            $notifyStmt = $db->prepare($notifyQuery);
            $notifyStmt->bindParam(':user_id', $challenge['challenger_id']);
            $notifyStmt->bindParam(':message', $message);
            $notifyStmt->execute();
        }

        // Commit transaction
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => $data->accept ? "Challenge accepted, game created" : "Challenge declined",
            "status" => $status,
            "gameId" => $data->accept ? $gameId : null
        ]);
    } catch(Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        throw $e;
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to process challenge response",
        "error" => $e->getMessage()
    ]);
}
?>
