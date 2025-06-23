<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user token
    $user = verifyToken();
    if (!$user || ($user['role'] !== 'admin' && $user['role'] !== 'teacher')) {
        http_response_code(403);
        echo json_encode(["message" => "Access denied. Only admins and teachers can share resources."]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();

    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['resource_id']) || !isset($data['batch_id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Resource ID and Batch ID are required"]);
        exit();
    }

    $resource_id = $data['resource_id'];
    $batch_id = $data['batch_id'];

    // Check if resource exists
    $resource_check = "SELECT id FROM resources WHERE id = :resource_id";
    $stmt = $db->prepare($resource_check);
    $stmt->bindParam(":resource_id", $resource_id);
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Resource not found"]);
        exit();
    }

    // Check if batch exists and user has access
    $batch_check = "SELECT id FROM batches WHERE id = :batch_id";
    if ($user['role'] === 'teacher') {
        $batch_check .= " AND teacher_id = :teacher_id";
    }
    
    $stmt = $db->prepare($batch_check);
    $stmt->bindParam(":batch_id", $batch_id);
    if ($user['role'] === 'teacher') {
        $stmt->bindParam(":teacher_id", $user['id']);
    }
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Batch not found or access denied"]);
        exit();
    }

    // Share resource with batch
    $share_query = "INSERT IGNORE INTO batch_resources 
                   (batch_id, resource_id, shared_by) 
                   VALUES (:batch_id, :resource_id, :shared_by)";
    
    $stmt = $db->prepare($share_query);
    $stmt->bindParam(":batch_id", $batch_id);
    $stmt->bindParam(":resource_id", $resource_id);
    $stmt->bindParam(":shared_by", $user['id']);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "message" => "Resource shared with batch successfully",
            "resource_id" => $resource_id,
            "batch_id" => $batch_id
        ]);
    } else {
        throw new Exception("Failed to share resource with batch");
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error sharing resource with batch",
        "error" => $e->getMessage()
    ]);
}
?>
