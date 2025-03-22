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
    
    // Check if tournament exists and is upcoming
    $tournament_details = $tournament->getTournamentById($data->tournament_id);
    
    if (!$tournament_details) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Tournament not found"
        ]);
        exit;
    }
    
    if ($tournament_details['status'] !== 'upcoming') {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Registration is only open for upcoming tournaments"
        ]);
        exit;
    }
    
    // Check if tournament has reached max participants
    if ($tournament_details['max_participants'] && $tournament_details['participant_count'] >= $tournament_details['max_participants']) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Tournament has reached maximum participants"
        ]);
        exit;
    }
    
    // Check if user is already registered
    $isRegistered = $tournament->checkRegistration($data->tournament_id, $user['id']);
    
    if ($isRegistered) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "You are already registered for this tournament"
        ]);
        exit;
    }
    
    // Register user for the tournament
    $tournament->registerUser($data->tournament_id, $user['id']);
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Successfully registered for the tournament"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to register for tournament",
        "error" => $e->getMessage()
    ]);
}
?>
