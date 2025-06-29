<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->user_ids) || !is_array($data->user_ids)) {
        throw new Exception('Missing required fields');
    }
    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();
    // Delete user permissions and logs first
    $delPerms = $db->prepare("DELETE FROM user_permissions WHERE user_id = ?");
    $delLogs = $db->prepare("DELETE FROM activity_logs WHERE user_id = ?");
    $delUser = $db->prepare("DELETE FROM users WHERE id = ?");
    foreach ($data->user_ids as $user_id) {
        $delPerms->execute([$user_id]);
        $delLogs->execute([$user_id]);
        $delUser->execute([$user_id]);
    }
    $db->commit();
    echo json_encode(['success' => true, 'message' => 'Users deleted']);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
