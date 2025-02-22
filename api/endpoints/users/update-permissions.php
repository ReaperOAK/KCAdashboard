<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once '../../models/Permission.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);
$permission = new Permission($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id) && !empty($data->permissions)) {
    try {
        $db->beginTransaction();
        
        // Clear existing permissions
        $stmt = $db->prepare("DELETE FROM user_permissions WHERE user_id = ?");
        $stmt->execute([$data->user_id]);
        
        // Add new permissions
        $stmt = $db->prepare("INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)");
        foreach ($data->permissions as $permissionId) {
            $stmt->execute([$data->user_id, $permissionId]);
        }
        
        $db->commit();
        echo json_encode(["success" => true, "message" => "Permissions updated successfully"]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update permissions"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required data"]);
}
