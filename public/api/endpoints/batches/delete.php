<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../models/Batch.php';
require_once '../../utils/authorize.php';

try {
    $user = authorize(['teacher']);
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$id || $id <= 0) {
        throw new Exception('Invalid batch ID provided');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $batch = new Batch($db);
    
    if($batch->delete($id, $user['id'])) {
        echo json_encode([
            'success' => true, 
            'message' => 'Batch and all related data (attendance records, sessions, student enrollments) deleted successfully'
        ]);
    } else {
        throw new Exception('Failed to delete batch');
    }
} catch(PDOException $e) {
    // Handle specific database errors
    http_response_code(500);
    $errorMessage = $e->getMessage();
    
    // Check for foreign key constraint violations
    if (strpos($errorMessage, 'Integrity constraint violation') !== false) {
        if (strpos($errorMessage, 'attendance') !== false) {
            $message = 'Cannot delete batch: There are attendance records that depend on this batch. Please contact system administrator.';
        } elseif (strpos($errorMessage, 'batch_sessions') !== false) {
            $message = 'Cannot delete batch: There are session records that depend on this batch. Please contact system administrator.';
        } else {
            $message = 'Cannot delete batch due to database constraints. There may be related records that need to be handled first.';
        }
    } else {
        $message = 'Database error occurred while deleting batch: ' . $errorMessage;
    }
    
    echo json_encode([
        'success' => false, 
        'message' => $message,
        'error_type' => 'database_error'
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error deleting batch: ' . $e->getMessage(),
        'error_type' => 'general_error'
    ]);
}
?>
