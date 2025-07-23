
<?php
require_once '../../config/cors.php';
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once '../../models/Permission.php';
require_once '../../middleware/auth.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Authenticate and verify admin role
    $currentUser = getAuthUser();
    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    
    if ($currentUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required to modify user roles']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->role)) {
        throw new Exception('Missing required fields: user_id and role');
    }

    // Validate role
    $validRoles = ['student', 'teacher', 'admin'];
    if (!in_array($data->role, $validRoles)) {
        throw new Exception('Invalid role specified');
    }

    // Prevent users from changing their own role to avoid lockout scenarios
    if ($currentUser['id'] == $data->user_id && $data->role !== 'admin') {
        throw new Exception('You cannot change your own admin role');
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
        "Role updated to {$data->role} by admin {$currentUser['id']} ({$currentUser['email']})",
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
