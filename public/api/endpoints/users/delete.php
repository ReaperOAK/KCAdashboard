<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../models/User.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Get raw posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->current_user_id)) {
        throw new Exception('Missing required fields');
    }

    // Prevent self-deletion
    if ($data->user_id == $data->current_user_id) {
        throw new Exception('You cannot delete your own account');
    }

    // Check if current user exists and has permission
    $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$data->current_user_id]);
    $current_user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$current_user || $current_user['role'] !== 'admin') {
        throw new Exception('Unauthorized action');
    }

    // Start transaction
    $db->beginTransaction();

    try {
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


        // Delete user permissions first
        $stmt = $db->prepare("DELETE FROM user_permissions WHERE user_id = ?");
        $stmt->execute([$data->user_id]);

        // Delete user's activity logs
        $stmt = $db->prepare("DELETE FROM activity_logs WHERE user_id = ?");
        $stmt->execute([$data->user_id]);

        // Delete from auth_tokens
        $stmt = $db->prepare("DELETE FROM auth_tokens WHERE user_id = ?");
        $stmt->execute([$data->user_id]);

        // Delete from email_verifications
        $stmt = $db->prepare("DELETE FROM email_verifications WHERE user_id = ?");
        $stmt->execute([$data->user_id]);

        // Delete from password_resets
        $stmt = $db->prepare("DELETE FROM password_resets WHERE user_id = ?");
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
        throw $e;
    }

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete user: " . $e->getMessage()
    ]);
}
?>
