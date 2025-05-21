<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Notification.php';
require_once '../../middleware/auth.php';

try {
    // Get user_id from token
    $user_id = validateToken();
    
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
    http_response_code(500);
    echo json_encode([
        "message" => "Error marking notifications as read",
        "error" => $e->getMessage()
    ]);
}
?>
