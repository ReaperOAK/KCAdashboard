<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Notification.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $notification = new Notification($db);

    // Get user_id from the token
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    
    // Validate token and get user_id
    // ... add your token validation logic here ...
    $user_id = 1; // Temporary! Replace with actual user_id from token

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
