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
    
    // Debug logging
    error_log("Received data: " . print_r($data, true));
    
    // Validate input
    if (!isset($data->user_id) || !isset($data->permissions)) {
        throw new Exception('Missing required fields: user_id or permissions');
    }

    if (!is_array($data->permissions)) {
        throw new Exception('Permissions must be an array');
    }

    // Start transaction
    $db->beginTransaction();
    
    // Verify user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$data->user_id]);
    if (!$stmt->fetch()) {
        throw new Exception('User not found');
    }
    
    // Delete existing permissions
    $stmt = $db->prepare("DELETE FROM user_permissions WHERE user_id = ?");
    if (!$stmt->execute([$data->user_id])) {
        throw new Exception('Failed to clear existing permissions');
    }
    
    if (!empty($data->permissions)) {
        // Extract permission IDs
        $permissionIds = array_map(function($p) {
            return isset($p->id) ? (int)$p->id : 0;
        }, $data->permissions);
        
        // Filter out invalid IDs
        $permissionIds = array_filter($permissionIds);
        
        if (empty($permissionIds)) {
            throw new Exception('No valid permission IDs provided');
        }
        
        // Validate permissions exist
        $inQuery = str_repeat('?,', count($permissionIds) - 1) . '?';
        $stmt = $db->prepare("SELECT id FROM permissions WHERE id IN ($inQuery)");
        $stmt->execute($permissionIds);
        $validPermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($validPermissions)) {
            throw new Exception('No valid permissions found in database');
        }
        
        // Insert new permissions
        $stmt = $db->prepare("INSERT INTO user_permissions (user_id, permission_id, granted_by) 
                            VALUES (?, ?, ?)");
        
        foreach ($validPermissions as $permissionId) {
            if (!$stmt->execute([
                $data->user_id,
                $permissionId,
                $_SESSION['user_id'] ?? 1
            ])) {
                throw new Exception('Failed to insert permission: ' . $permissionId);
            }
        }
    }
    
    // Log the action
    $stmt = $db->prepare("INSERT INTO activity_logs (user_id, action, description, ip_address) 
                         VALUES (?, 'update_permissions', ?, ?)");
    $stmt->execute([
        $data->user_id,
        'Permissions updated by admin',
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);
    
    $db->commit();
    
    // Return updated permissions
    $stmt = $db->prepare("SELECT p.* FROM permissions p 
                         INNER JOIN user_permissions up ON p.id = up.permission_id 
                         WHERE up.user_id = ?");
    $stmt->execute([$data->user_id]);
    $updatedPermissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "message" => "Permissions updated successfully",
        "permissions" => $updatedPermissions
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
