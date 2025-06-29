<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../config/cors.php';
require_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();

try {
    if (!isset($_GET['id'])) {
        throw new Exception('User ID is required');
    }

    $userId = (int)$_GET['id'];

    // Get user details
    $stmt = $db->prepare("
        SELECT u.id, u.email, u.full_name, u.role, u.status, u.created_at,
               u.profile_picture, u.is_active
        FROM users u
        WHERE u.id = ?
    ");
    
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found');
    }

    // Get user permissions
    $stmt = $db->prepare("
        SELECT p.name
        FROM permissions p
        INNER JOIN user_permissions up ON p.id = up.permission_id
        WHERE up.user_id = ?
    ");
    $stmt->execute([$userId]);
    $user['permissions'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Get recent activity
    $stmt = $db->prepare("
        SELECT *
        FROM activity_logs
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$userId]);
    $user['recent_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "user" => $user
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
