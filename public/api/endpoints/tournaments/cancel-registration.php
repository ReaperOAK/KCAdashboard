<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Tournament.php';
require_once '../../middleware/auth.php';

try {
    // Get user ID from token
    $user = getAuthUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized access"
        ]);
        exit;
    }

    // Get tournament ID from request
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->tournament_id)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Tournament ID is required"
        ]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    $tournament = new Tournament($db);
    
    // Check if tournament exists
    $tournament_details = $tournament->getTournamentById($data->tournament_id);
    
    if (!$tournament_details) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Tournament not found"
        ]);
        exit;
    }
    
    // Check if user is registered for this tournament
    $isRegistered = $tournament->checkRegistration($data->tournament_id, $user['id']);
    
    if (!$isRegistered) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "You are not registered for this tournament"
        ]);
        exit;
    }
    
    // Cancel registration
    $tournament->cancelRegistration($data->tournament_id, $user['id']);
    
    // Record cancellation in activity logs
    $action = "tournament_registration_canceled";
    $description = "User cancelled registration for tournament: " . $tournament_details['title'];
    
    $logQuery = "INSERT INTO activity_logs
                 (user_id, action, description, ip_address, created_at)
                 VALUES (:user_id, :action, :description, :ip_address, NOW())";
                 
    $logStmt = $db->prepare($logQuery);
    $logStmt->bindParam(":user_id", $user['id']);
    $logStmt->bindParam(":action", $action);
    $logStmt->bindParam(":description", $description);
    $logStmt->bindParam(":ip_address", $_SERVER['REMOTE_ADDR']);
    $logStmt->execute();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Tournament registration cancelled successfully"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to cancel registration",
        "error" => $e->getMessage()
    ]);
}
?>
