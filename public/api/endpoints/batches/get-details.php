<?php
require_once '../../config/cors.php';
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/Batch.php';
require_once '../../utils/authorize.php';

try {
    $user = authorize(['teacher']);
    $id = isset($_GET['id']) ? $_GET['id'] : die();
    
    $database = new Database();
    $db = $database->getConnection();
    
    $batch = new Batch($db);
    $result = $batch->getDetails($id, $user['id']);
    
    if($result) {
        echo json_encode(['success' => true, 'batch' => $result]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Batch not found']);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
