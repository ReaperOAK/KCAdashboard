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
    
    $database = new Database();
    $db = $database->getConnection();
    $tournament = new Tournament($db);
    
    // Get all user registrations
    $registrations = $tournament->getUserRegistrations($user['id']);
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "registrations" => $registrations
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch registration status",
        "error" => $e->getMessage()
    ]);
}
?>
