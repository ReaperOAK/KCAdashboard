<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/Batch.php';
require_once '../../utils/authorize.php';

try {
    // Verify teacher authorization
    $user = authorize(['teacher']);
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->name) || !isset($data->level) || !isset($data->schedule)) {
        throw new Exception('Missing required fields');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $batch = new Batch($db);
    $batch->name = $data->name;
    $batch->description = $data->description ?? '';
    $batch->level = $data->level;
    $batch->schedule = $data->schedule;
    $batch->max_students = $data->max_students ?? 10;
    $batch->teacher_id = $user['id'];
    
    if($batch->create()) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Batch created successfully']);
    } else {
        throw new Exception('Failed to create batch');
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
