<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../models/Notification.php';
require_once '../../middleware/auth.php';
require_once '../../services/NotificationService.php';

try {
    // Get the POST data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if(!isset($data->id)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing notification ID"]);
        exit();
    }
    
    // Get user_id from token
    $user_id = validateToken();
    
    $database = new Database();
    $db = $database->getConnection();
    $notificationService = new NotificationService();
    // Use NotificationService for deletion logic
    $result = false;
    if (method_exists($notificationService, 'deleteNotification')) {
        $result = $notificationService->deleteNotification($data->id, $user_id);
    } else {
        // fallback to model if service method not available
        $notification = new Notification($db);
        $result = $notification->deleteNotification($data->id, $user_id);
    }
    if($result) {
        http_response_code(200);
        echo json_encode([
            "message" => "Notification deleted successfully"
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Notification not found or you don't have permission to delete it"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error deleting notification",
        "error" => $e->getMessage()
    ]);
}
?>
