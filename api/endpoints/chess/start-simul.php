<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessSimul.php';
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
    if(!isset($data->simul_id)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required field (simul_id)"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize simul object
    $simul = new ChessSimul($db);
    
    // Get the simul details to verify ownership
    $stmt = $simul->getById($data->simul_id);
    
    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Simul not found"
        ]);
        exit;
    }
    
    $simul_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify the user is the host
    if($simul_data['host_id'] != $user['id']) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Only the host can start the simul"
        ]);
        exit;
    }
    
    // Verify there are players
    $boards_stmt = $simul->getBoards($data->simul_id);
    if($boards_stmt->rowCount() == 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Cannot start simul without players"
        ]);
        exit;
    }
    
    // Verify the simul is in pending status
    if($simul_data['status'] != 'pending') {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Can only start simuls that are in pending status"
        ]);
        exit;
    }
    
    // Start the simul
    if($simul->startSimul($data->simul_id)) {
        // Create notifications for all participants
        $notifyQuery = "INSERT INTO notifications 
                       (user_id, title, message, type, is_read, created_at) 
                       VALUES (:user_id, 'Simul Started', :message, 'chess', 0, NOW())";
        
        $message = "The simultaneous exhibition \"{$simul_data['title']}\" by {$user['full_name']} has started.";
        
        // Get all players
        $players = [];
        while($board = $boards_stmt->fetch(PDO::FETCH_ASSOC)) {
            $players[] = $board['player_id'];
        }
        
        // Send notification to each player
        foreach($players as $player_id) {
            $notifyStmt = $db->prepare($notifyQuery);
            $notifyStmt->bindParam(':user_id', $player_id);
            $notifyStmt->bindParam(':message', $message);
            $notifyStmt->execute();
        }
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Simul started successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to start simul"
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to start simul",
        "error" => $e->getMessage()
    ]);
}
?>