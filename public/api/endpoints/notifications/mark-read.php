<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Notification.php';
require_once '../../middleware/auth.php';

try {
    // Get the POST data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if(!isset($data->id)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields"]);
        exit();
    }
    
    // Get user_id from token
    $user_id = validateToken();
    
    $database = new Database();
    $db = $database->getConnection();
    $notification = new Notification($db);
    
    // Mark notification as read
    if($notification->markAsRead($data->id, $user_id)) {
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
    http_response_code(500);
    echo json_encode([
        "message" => "Error marking notification as read",
        "error" => $e->getMessage()
    ]);
}
?>
