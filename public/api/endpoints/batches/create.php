<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    require_once '../../config/Database.php';
    require_once '../../models/Batch.php';
    require_once '../../utils/authorize.php';

    // Verify teacher authorization
    $user = authorize(['teacher', 'admin']);
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->name) || !isset($data->level) || !isset($data->schedule)) {
        throw new Exception('Missing required fields: name, level, and schedule are required');
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
    
    // Create batch and classroom together
    $result = $batch->create();
    
    if($result) {
        http_response_code(201);
        echo json_encode([
            'success' => true, 
            'message' => 'Batch and classroom created successfully',
            'data' => $result
        ]);
    } else {
        throw new Exception('Failed to create batch and classroom');
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
