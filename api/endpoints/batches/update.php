<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/Batch.php';
require_once '../../utils/authorize.php';

try {
    $user = authorize(['teacher']);
    $data = json_decode(file_get_contents("php://input"));
    $id = isset($_GET['id']) ? $_GET['id'] : die();
    
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
    $batch->status = $data->status ?? 'active';
    $batch->teacher_id = $user['id'];
    
    if($batch->update($id)) {
        echo json_encode(['success' => true, 'message' => 'Batch updated successfully']);
    } else {
        throw new Exception('Failed to update batch');
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
