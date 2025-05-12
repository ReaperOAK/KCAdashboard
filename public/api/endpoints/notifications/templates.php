<?php
require_once '../../config/cors.php';
require_once '../../middleware/auth.php';
require_once '../../services/NotificationService.php';

try {
    // Verify user is authenticated
    $user_id = validateToken();
    
    // Get user role to check if admin
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);
    $currentUser = $user->getById($user_id);
    
    if($currentUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Only admins can access notification templates"]);
        exit();
    }
    
    // Get templates
    $notificationService = new NotificationService();
    $templates = $notificationService->getTemplates();
    
    http_response_code(200);
    echo json_encode([
        "templates" => $templates
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error retrieving notification templates",
        "error" => $e->getMessage()
    ]);
}
?>
