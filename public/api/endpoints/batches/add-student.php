<?php
require_once '../../config/cors.php';

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    // Include required files
    require_once '../../config/Database.php';
    require_once '../../models/Batch.php';
    require_once '../../utils/authorize.php';

    // Verify teacher authorization
    try {
        $user = authorize(['teacher', 'admin']);
    } catch (Exception $authEx) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication failed: ' . $authEx->getMessage()]);
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if(!isset($data->batch_id) || !isset($data->student_id)) {
        throw new Exception('Batch ID and student ID are required');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $batch = new Batch($db);
    
    // Verify the batch belongs to the teacher if they're not an admin
    if($user['role'] === 'teacher') {
        if(!$batch->verifyTeacherOwnership($data->batch_id, $user['id'])) {
            throw new Exception('You do not have permission to modify this batch');
        }
    }
      // Add student to batch (this automatically adds them to the classroom too)
    $result = $batch->addStudent($data->batch_id, $data->student_id);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Student added to batch and classroom successfully',
        'data' => $result
    ]);
    
} catch(Exception $e) {
    // Log error to server log
    error_log("Add Student to Batch Error: " . $e->getMessage());
    
    // Return proper error response
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
