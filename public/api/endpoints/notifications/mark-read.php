<?php
// CORS and security header
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Notification.php';
require_once '../../middleware/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Get the POST data
    $data = json_decode(file_get_contents("php://input"));

    // Validate required fields
    if(!isset($data->id) || !is_numeric($data->id) || intval($data->id) <= 0) {
        http_response_code(400);
        echo json_encode(["message" => "Missing or invalid notification ID"]);
        exit();
    }

    // Get user_id from token and sanitize
    $user_id = validateToken();
    if (!is_numeric($user_id) || intval($user_id) <= 0) {
        throw new Exception("Invalid user ID");
    }
    $user_id = intval($user_id);
    $notif_id = intval($data->id);

    $database = new Database();
    $db = $database->getConnection();
    $notification = new Notification($db);

    // Mark notification as read
    if($notification->markAsRead($notif_id, $user_id)) {
        // Return updated unread count
        $unread_count = $notification->getUnreadCount($user_id);

        http_response_code(200);
        echo json_encode([
            "message" => "Notification marked as read",
            "unread_count" => $unread_count
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Notification not found or already read"]);
    }
} catch (Exception $e) {
    error_log("[notifications/mark-read.php] " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Error marking notification as read",
        "error" => $e->getMessage()
    ]);
}
?>
