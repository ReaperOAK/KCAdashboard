<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once '../../models/Permission.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate input
    if (!isset($data->user_id) || !isset($data->permissions) || !is_array($data->permissions)) {
        throw new Exception('Invalid input data');
    }

    // Start transaction
    $db->beginTransaction();
    
    // Delete existing permissions
    $stmt = $db->prepare("DELETE FROM user_permissions WHERE user_id = ?");
    if (!$stmt->execute([$data->user_id])) {
        throw new Exception('Failed to clear existing permissions');
    }
    
    if (!empty($data->permissions)) {
        // Validate permissions exist
        $permissionIds = implode(',', array_map('intval', $data->permissions));
        $stmt = $db->prepare("SELECT id FROM permissions WHERE id IN ($permissionIds)");
        $stmt->execute();
        $validPermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($validPermissions)) {
            throw new Exception('No valid permissions provided');
        }
        
        // Insert new permissions
        $stmt = $db->prepare("INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at) 
                            VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
        
        foreach ($validPermissions as $permissionId) {
            if (!$stmt->execute([
                $data->user_id,
                $permissionId,
                $_SESSION['user_id'] ?? 1 // Default to admin if session not available
            ])) {
                throw new Exception('Failed to insert permission');
            }
        }
    }
    
    // Log the action
    $stmt = $db->prepare("INSERT INTO activity_logs (user_id, action, description) 
                         VALUES (?, 'update_permissions', ?)");
    $stmt->execute([
        $data->user_id,
        'Permissions updated by admin'
    ]);
    
    $db->commit();
    
    echo json_encode([
        "success" => true,
        "message" => "Permissions updated successfully"
    ]);
    
} catch (Exception $e) {
    $db->rollBack();
    error_log("Permission Update Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update permissions: " . $e->getMessage()
    ]);
}
