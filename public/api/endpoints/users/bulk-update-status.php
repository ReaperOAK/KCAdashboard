<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->user_ids) || !is_array($data->user_ids) || !isset($data->status)) {
        throw new Exception('Missing required fields');
    }
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);
    $status = $data->status;
    $validStatuses = ['active', 'inactive', 'suspended'];
    if (!in_array($status, $validStatuses)) {
        throw new Exception('Invalid status');
    }
    $db->beginTransaction();
    $stmt = $db->prepare("UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    foreach ($data->user_ids as $user_id) {
        $stmt->execute([$status, $user_id]);
    }
    $db->commit();
    echo json_encode(['success' => true, 'message' => 'Statuses updated']);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
