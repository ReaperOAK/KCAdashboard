<?php
// CORS and security header
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Notification.php';
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
    $notification = new Notification($db);

    // Mark all notifications as read
    if($notification->markAllAsRead($user_id)) {
        http_response_code(200);
        echo json_encode([
            "message" => "All notifications marked as read",
            "unread_count" => 0
        ]);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Failed to mark notifications as read"]);
    }
} catch (Exception $e) {
    error_log("[notifications/mark-all-read.php] " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Error marking notifications as read",
        "error" => $e->getMessage()
    ]);
}
?>
