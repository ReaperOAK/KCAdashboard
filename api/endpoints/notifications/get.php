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

    $notifications = $notification->getUserNotifications($user_id);
    $unread_count = $notification->getUnreadCount($user_id);

    http_response_code(200);
    echo json_encode([
        "notifications" => $notifications,
        "unread_count" => $unread_count
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching notifications",
        "error" => $e->getMessage()
    ]);
}
?>
