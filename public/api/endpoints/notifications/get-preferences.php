<?php
// CORS and security header
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/NotificationPreference.php';
require_once '../../middleware/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Get user_id from token and sanitize
    $user_id = validateToken();
    if (!is_numeric($user_id) || intval($user_id) <= 0) {
        throw new Exception("Invalid user ID");
    }
    $user_id = intval($user_id);

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
    error_log("[notifications/get-preferences.php] " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Error retrieving notification preferences",
        "error" => $e->getMessage()
    ]);
}
?>
