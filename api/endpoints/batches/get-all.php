<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/Batch.php';
require_once '../../utils/authorize.php';

try {
    // Verify teacher authorization
    $user = authorize(['teacher']);
    
    $database = new Database();
    $db = $database->getConnection();
    
    $batch = new Batch($db);
    $result = $batch->getAllByTeacher($user['id']);
    
    if($result) {
        http_response_code(200);
        echo json_encode(['success' => true, 'batches' => $result]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No batches found']);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
