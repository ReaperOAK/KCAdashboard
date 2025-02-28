<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/Batch.php';
require_once '../../utils/authorize.php';

try {
    // Verify teacher authorization
    $user = authorize(['teacher', 'admin']); // Allow both teacher and admin roles
    
    $database = new Database();
    $db = $database->getConnection();
    
    $batch = new Batch($db);
    
    // Call the appropriate method based on role
    if ($user['role'] === 'teacher') {
        $result = $batch->getAllByTeacher($user['id']);
    } else {
        $result = $batch->getAllBatches(); // For admin
    }
    
    // Always return a valid JSON response
    if($result) {
        http_response_code(200);
        echo json_encode(['success' => true, 'batches' => $result]);
    } else {
        http_response_code(200); // Use 200 instead of 404 for empty results
        echo json_encode(['success' => true, 'batches' => [], 'message' => 'No batches found']);
    }
} catch(Exception $e) {
    // Log error to server log
    error_log("Batch API Error: " . $e->getMessage());
    
    // Return proper error response
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
