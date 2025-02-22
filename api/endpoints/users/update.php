<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->full_name) || !isset($data->email) || !isset($data->role)) {
        throw new Exception('Missing required fields');
    }

    // Validate role
    $validRoles = ['student', 'teacher', 'admin'];
    if (!in_array($data->role, $validRoles)) {
        throw new Exception('Invalid role specified');
    }

    // Start transaction
    $db->beginTransaction();

    // Update user
    $stmt = $db->prepare("
        UPDATE users 
        SET full_name = ?, 
            email = ?, 
            role = ?, 
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");

    if (!$stmt->execute([
        $data->full_name,
        $data->email,
        $data->role,
        $data->status,
        $data->user_id
    ])) {
        throw new Exception('Failed to update user');
    }

    // Log the action
    $stmt = $db->prepare("
        INSERT INTO activity_logs (user_id, action, description, ip_address) 
        VALUES (?, 'user_update', ?, ?)
    ");
    
    $description = "User details updated. Role changed to: {$data->role}";
    $stmt->execute([
        $data->user_id,
        $description,
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $db->commit();

    // Fetch updated user data
    $stmt = $db->prepare("
        SELECT id, email, full_name, role, status, is_active
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$data->user_id]);
    $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "message" => "User updated successfully",
        "user" => $updatedUser
    ]);

} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update user: " . $e->getMessage()
    ]);
}
?>
