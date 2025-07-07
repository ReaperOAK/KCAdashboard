<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Notification.php';
require_once '../../models/User.php';
require_once '../../services/NotificationService.php';
require_once '../../middleware/auth.php';

try {
    // Get the POST data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if(!isset($data->title) || !isset($data->message) || !isset($data->recipients)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields"]);
        exit();
    }
    
    // Get user_id from token and verify admin role
    $user_id = validateToken();
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);
    $currentUser = $user->getById($user_id);
    
    if($currentUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Only admins can send notifications"]);
        exit();
    }
    
    // Initialize services
    $notificationService = new NotificationService();
    
    // Get parameters
    $title = $data->title;
    $message = $data->message;
    // Validate category
    $allowed_categories = [
        'general',
        'class',
        'tournament',
        'assignment',
        'attendance',
        'announcement',
        'achievement'
    ];
    $category = $data->category ?? 'general';
    if (!in_array($category, $allowed_categories, true)) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid notification category. Allowed: " . implode(', ', $allowed_categories)]);
        exit();
    }
    $sendEmail = $data->send_email ?? false;
    $linkUrl = $data->link ?? null;
    $recipients = $data->recipients; // Can be array of user IDs or "all", "students", "teachers"
    
    // Get user IDs based on recipient type
    $user_ids = [];
    if(is_array($recipients)) {
        $user_ids = $recipients;
    } else {
        switch($recipients) {
            case 'all':
                $user_ids = $user->getAllUserIds();
                break;
            case 'students':
                $user_ids = $user->getUserIdsByRole('student');
                break;
            case 'teachers':
                $user_ids = $user->getUserIdsByRole('teacher');
                break;
            default:
                http_response_code(400);
                echo json_encode(["message" => "Invalid recipient type"]);
                exit();
        }
    }
    
    // Check if we're using a template
    if(isset($data->template) && !empty($data->template)) {
        $template = $data->template;
        $params = $data->params ?? [];
        $result = $notificationService->sendBulkFromTemplate($user_ids, $template, $params, $sendEmail, $linkUrl);
    } else {
        // Send custom notification
        $result = $notificationService->sendBulkCustom($user_ids, $title, $message, $category, $sendEmail, $linkUrl);
    }
    
    http_response_code(200);
    echo json_encode([
        "message" => "Notifications sent",
        "result" => $result
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error sending notifications",
        "error" => $e->getMessage()
    ]);
}
?>
