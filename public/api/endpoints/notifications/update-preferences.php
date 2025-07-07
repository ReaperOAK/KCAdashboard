<?php
// CORS and security header
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/NotificationPreference.php';
require_once '../../middleware/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Get the POST data
    $data = json_decode(file_get_contents("php://input"));

    // Validate required fields
    if(!isset($data->preferences) || !is_array($data->preferences)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid preferences data"]);
        exit();
    }

    // Get user_id from token and sanitize
    $user_id = validateToken();
    if (!is_numeric($user_id) || intval($user_id) <= 0) {
        throw new Exception("Invalid user ID");
    }
    $user_id = intval($user_id);

    $database = new Database();
    $db = $database->getConnection();
    $preference = new NotificationPreference($db);

    // Update user preferences
    if($preference->updateBulkPreferences($user_id, $data->preferences)) {
        $updated_preferences = $preference->getUserPreferences($user_id);

        http_response_code(200);
        echo json_encode([
            "message" => "Notification preferences updated successfully",
            "preferences" => $updated_preferences
        ]);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Failed to update notification preferences"]);
    }

} catch (Exception $e) {
    error_log("[notifications/update-preferences.php] " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Error updating notification preferences",
        "error" => $e->getMessage()
    ]);
}
?>
