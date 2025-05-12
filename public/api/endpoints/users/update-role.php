<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once '../../models/Permission.php';

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->role) || !isset($data->current_user_id)) {
        throw new Exception('Missing required fields');
    }

    // Validate role
    $validRoles = ['student', 'teacher', 'admin'];
    if (!in_array($data->role, $validRoles)) {
        throw new Exception('Invalid role specified');
    }

    // Start transaction
    $db->beginTransaction();

    // Update user role
    $stmt = $db->prepare("UPDATE users SET role = ? WHERE id = ?");
    if (!$stmt->execute([$data->role, $data->user_id])) {
        throw new Exception('Failed to update user role');
    }

    // Log the action
    $stmt = $db->prepare("INSERT INTO activity_logs (user_id, action, description, ip_address) 
                         VALUES (?, 'role_update', ?, ?)");
    $stmt->execute([
        $data->user_id,
        "Role updated to {$data->role} by user {$data->current_user_id}",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Role updated successfully"
    ]);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update role: " . $e->getMessage()
    ]);
}
?>
