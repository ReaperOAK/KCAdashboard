<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->current_user_id)) {
        throw new Exception('Missing required fields');
    }

    // Prevent self-deletion
    if ($data->user_id == $data->current_user_id) {
        throw new Exception('You cannot delete your own account');
    }

    // Start transaction
    $db->beginTransaction();

    // Log the deletion
    $stmt = $db->prepare("
        INSERT INTO activity_logs (user_id, action, description, ip_address) 
        VALUES (?, 'user_delete', ?, ?)
    ");
    
    $stmt->execute([
        $data->current_user_id,
        "User ID {$data->user_id} deleted by user {$data->current_user_id}",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    // Delete user permissions first (if foreign key constraint exists)
    $stmt = $db->prepare("DELETE FROM user_permissions WHERE user_id = ?");
    $stmt->execute([$data->user_id]);

    // Delete the user
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    if (!$stmt->execute([$data->user_id])) {
        throw new Exception('Failed to delete user');
    }

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "User deleted successfully"
    ]);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete user: " . $e->getMessage()
    ]);
}
?>
