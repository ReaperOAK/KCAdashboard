<?php
// CORS and security header
require_once '../../config/cors.php';
require_once '../../middleware/auth.php';
require_once '../../services/NotificationService.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Verify user is authenticated and sanitize
    $user_id = validateToken();
    if (!is_numeric($user_id) || intval($user_id) <= 0) {
        throw new Exception("Invalid user ID");
    }
    $user_id = intval($user_id);

    // Get user role to check if admin
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);
    $currentUser = $user->getById($user_id);
    if (!isset($currentUser['role']) || $currentUser['role'] !== 'admin') {
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
    error_log("[notifications/templates.php] " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Error retrieving notification templates",
        "error" => $e->getMessage()
    ]);
}
?>
