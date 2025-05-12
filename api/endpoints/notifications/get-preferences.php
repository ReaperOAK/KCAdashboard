<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/NotificationPreference.php';
require_once '../../middleware/auth.php';

try {
    // Get user_id from token
    $user_id = validateToken();
    
    $database = new Database();
    $db = $database->getConnection();
    $preference = new NotificationPreference($db);
    
    // Get user preferences
    $preference->user_id = $user_id;
    $preferences = $preference->getUserPreferences($user_id);
    
    http_response_code(200);
    echo json_encode([
        "preferences" => $preferences
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error retrieving notification preferences",
        "error" => $e->getMessage()
    ]);
}
?>
