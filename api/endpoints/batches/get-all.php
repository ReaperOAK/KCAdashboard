<?php
// Set appropriate headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    // Include required files
    require_once '../../config/Database.php';
    require_once '../../models/Batch.php';
    require_once '../../utils/authorize.php';

    // Verify teacher authorization - use a try/catch specifically for auth
    try {
        $user = authorize(['teacher', 'admin']);
    } catch (Exception $authEx) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication failed: ' . $authEx->getMessage()]);
        exit;
    }
    
    // Database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    $batch = new Batch($db);
    
    // Call the appropriate method based on role
    if ($user['role'] === 'teacher') {
        // Check if the method exists
        if (!method_exists($batch, 'getAllByTeacher')) {
            throw new Exception("Method getAllByTeacher does not exist in Batch class");
        }
        $result = $batch->getAllByTeacher($user['id']);
    } else {
        if (!method_exists($batch, 'getAllBatches')) {
            throw new Exception("Method getAllBatches does not exist in Batch class");
        }
        $result = $batch->getAllBatches(); // For admin
    }
    
    // Always return a valid JSON response
    http_response_code(200);
    echo json_encode(['success' => true, 'batches' => $result ? $result : []]);
    
} catch(Exception $e) {
    // Log error to server log
    error_log("Batch API Error: " . $e->getMessage());
    
    // Return proper error response
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage(),
        'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)
    ]);
}
?>
