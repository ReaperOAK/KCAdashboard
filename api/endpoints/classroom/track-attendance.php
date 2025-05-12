<?php
// Set maximum execution time to prevent timeout issues
set_time_limit(300);

// Enable maximum error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Create a custom error log file for this endpoint
$log_dir = __DIR__ . '/../../logs';
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}
ini_set('log_errors', 1);
ini_set('error_log', $log_dir . '/attendance_errors.log');

// Log the start of the request
error_log("--- Track Attendance Request Started: " . date('Y-m-d H:i:s') . " ---");

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Define execution steps and initialize progress tracker
$steps = [
    'initialize' => false,
    'auth_check' => false,
    'data_validation' => false,
    'session_check' => false,
    'permission_check' => false,
    'transaction_started' => false,
    'records_deleted' => false,
    'records_inserted' => false,
    'session_updated' => false,
    'transaction_committed' => false
];

try {
    // Include required files
    require_once '../../config/Database.php';
    require_once '../../middleware/auth.php';
    $steps['initialize'] = true;
    error_log("Step: initialize - Success");
    
    // Verify token and get user
    $user_data = verifyToken();
    if (!$user_data) {
        error_log("Authentication failed - No user data returned");
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit;
    }
    
    if ($user_data['role'] !== 'teacher') {
        error_log("Role check failed - User is not a teacher: " . $user_data['role']);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access - Teacher role required']);
        exit;
    }
    $steps['auth_check'] = true;
    error_log("Step: auth_check - Success - User ID: " . $user_data['id'] . ", Role: " . $user_data['role']);
    
    // Get and validate request data
    $raw_data = file_get_contents("php://input");
    if (empty($raw_data)) {
        error_log("Empty request body");
        echo json_encode(['success' => false, 'message' => 'No data provided']);
        exit;
    }
    error_log("Raw request data: " . substr($raw_data, 0, 500) . (strlen($raw_data) > 500 ? "..." : ""));
    
    $data = json_decode($raw_data, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON parsing error: " . json_last_error_msg());
        echo json_encode(['success' => false, 'message' => 'Invalid JSON: ' . json_last_error_msg()]);
        exit;
    }
    
    if (!isset($data['session_id'])) {
        error_log("Missing session_id in request");
        echo json_encode(['success' => false, 'message' => 'Missing session_id']);
        exit;
    }
    
    if (!isset($data['attendance']) || !is_array($data['attendance'])) {
        error_log("Missing or invalid attendance data");
        echo json_encode(['success' => false, 'message' => 'Missing or invalid attendance data']);
        exit;
    }
    
    $session_id = intval($data['session_id']);
    if ($session_id <= 0) {
        error_log("Invalid session_id: " . $data['session_id']);
        echo json_encode(['success' => false, 'message' => 'Invalid session ID']);
        exit;
    }
    
    $steps['data_validation'] = true;
    error_log("Step: data_validation - Success - Session ID: $session_id, Attendance records: " . count($data['attendance']));
    
    // Connect to database
    try {
        $database = new Database();
        $db = $database->getConnection();
        error_log("Database connection established");
    } catch (Exception $e) {
        error_log("Database connection error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database connection error']);
        exit;
    }
    
    // Get session and classroom details
    try {
        $stmt = $db->prepare("
            SELECT bs.batch_id, c.teacher_id, c.name as classroom_name
            FROM batch_sessions bs
            JOIN classrooms c ON bs.batch_id = c.id
            WHERE bs.id = :session_id
        ");
        
        $stmt->bindParam(':session_id', $session_id);
        $stmt->execute();
        
        $session_info = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$session_info) {
            error_log("Session not found: $session_id");
            echo json_encode(['success' => false, 'message' => 'Session not found']);
            exit;
        }
        
        $steps['session_check'] = true;
        error_log("Step: session_check - Success - Batch ID: " . $session_info['batch_id'] . 
                 ", Teacher ID: " . $session_info['teacher_id'] . 
                 ", Classroom: " . $session_info['classroom_name']);
    } catch (Exception $e) {
        error_log("Error fetching session info: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error fetching session details']);
        exit;
    }
    
    // Verify teacher's permission
    if ($session_info['teacher_id'] != $user_data['id']) {
        error_log("Permission denied - Teacher ID mismatch: Expected " . $session_info['teacher_id'] . 
                 ", Got " . $user_data['id']);
        echo json_encode([
            'success' => false,
            'message' => 'You do not have permission to mark attendance for this session'
        ]);
        exit;
    }
    
    $steps['permission_check'] = true;
    error_log("Step: permission_check - Success");
    
    $batch_id = $session_info['batch_id'];
    
    // Begin transaction with retry logic
    $transaction_attempts = 0;
    $max_attempts = 3;
    $transaction_started = false;
    
    while ($transaction_attempts < $max_attempts && !$transaction_started) {
        try {
            $db->beginTransaction();
            $transaction_started = true;
            $steps['transaction_started'] = true;
            error_log("Step: transaction_started - Success (Attempt #" . ($transaction_attempts + 1) . ")");
        } catch (Exception $e) {
            $transaction_attempts++;
            error_log("Transaction start failed (Attempt #$transaction_attempts): " . $e->getMessage());
            if ($transaction_attempts >= $max_attempts) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Could not start database transaction after ' . $max_attempts . ' attempts'
                ]);
                exit;
            }
            // Wait before retrying
            sleep(1);
        }
    }
    
    // First, delete any existing attendance records for this session
    try {
        $delete_stmt = $db->prepare("
            DELETE FROM attendance 
            WHERE session_id = :session_id
        ");
        $delete_stmt->bindParam(':session_id', $session_id);
        $result = $delete_stmt->execute();
        
        $affected_rows = $delete_stmt->rowCount();
        $steps['records_deleted'] = true;
        error_log("Step: records_deleted - Success - Affected rows: $affected_rows");
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
            error_log("Transaction rolled back after delete failure");
        }
        error_log("Error deleting existing attendance records: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error clearing previous attendance records'
        ]);
        exit;
    }
    
    // Insert new attendance records one by one
    $insert_count = 0;
    $error_count = 0;
    
    try {
        $insert_stmt = $db->prepare("
            INSERT INTO attendance (
                student_id, batch_id, session_id, status,
                marked_by, notes, created_at, updated_at
            ) VALUES (
                :student_id, :batch_id, :session_id, :status,
                :marked_by, :notes, NOW(), NOW()
            )
        ");
        
        foreach ($data['attendance'] as $index => $record) {
            if (!isset($record['student_id']) || !isset($record['status'])) {
                error_log("Skipping invalid record at index $index: " . json_encode($record));
                $error_count++;
                continue;
            }
            
            // Convert and validate values
            $student_id = intval($record['student_id']);
            if ($student_id <= 0) {
                error_log("Invalid student_id at index $index: " . $record['student_id']);
                $error_count++;
                continue;
            }
            
            $status = $record['status'];
            if (!in_array($status, ['present', 'absent', 'excused', 'late'])) {
                error_log("Invalid status at index $index: " . $status);
                $status = 'absent'; // Default to absent if invalid
            }
            
            $notes = isset($record['notes']) ? $record['notes'] : null;
            $teacher_id = $user_data['id'];
            
            try {
                $insert_stmt->bindValue(':student_id', $student_id, PDO::PARAM_INT);
                $insert_stmt->bindValue(':batch_id', $batch_id, PDO::PARAM_INT);
                $insert_stmt->bindValue(':session_id', $session_id, PDO::PARAM_INT);
                $insert_stmt->bindValue(':status', $status, PDO::PARAM_STR);
                $insert_stmt->bindValue(':marked_by', $teacher_id, PDO::PARAM_INT);
                $insert_stmt->bindValue(':notes', $notes, PDO::PARAM_STR);
                
                $success = $insert_stmt->execute();
                
                if ($success) {
                    $insert_count++;
                } else {
                    error_log("Insert failed for student $student_id: " . implode(', ', $insert_stmt->errorInfo()));
                    $error_count++;
                }
            } catch (Exception $e) {
                error_log("Exception inserting attendance for student $student_id: " . $e->getMessage());
                $error_count++;
            }
        }
        
        $steps['records_inserted'] = true;
        error_log("Step: records_inserted - Success - Inserted: $insert_count, Errors: $error_count");
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
            error_log("Transaction rolled back after insert failure");
        }
        error_log("Error inserting attendance records: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error saving attendance records'
        ]);
        exit;
    }
    
    // Mark attendance as taken in the batch_sessions table
    try {
        $update_stmt = $db->prepare("
            UPDATE batch_sessions
            SET attendance_taken = 1
            WHERE id = :session_id
        ");
        $update_stmt->bindParam(':session_id', $session_id);
        $update_result = $update_stmt->execute();
        
        $steps['session_updated'] = true;
        error_log("Step: session_updated - Success - Update result: " . ($update_result ? 'true' : 'false'));
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
            error_log("Transaction rolled back after update failure");
        }
        error_log("Error updating session status: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error updating session attendance status'
        ]);
        exit;
    }
    
    // Commit transaction
    try {
        $db->commit();
        $steps['transaction_committed'] = true;
        error_log("Step: transaction_committed - Success");
    } catch (Exception $e) {
        error_log("Error committing transaction: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error finalizing attendance records'
        ]);
        exit;
    }
    
    // Success!
    error_log("Attendance tracking completed successfully - Session: $session_id, Records: $insert_count");
    echo json_encode([
        'success' => true,
        'message' => 'Attendance recorded successfully',
        'inserted_count' => $insert_count,
        'error_count' => $error_count
    ]);
    
} catch (Exception $e) {
    // Catch-all error handler
    error_log("CRITICAL ERROR: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Log the steps that were completed
    $completed_steps = array_filter($steps);
    error_log("Completed steps: " . implode(", ", array_keys($completed_steps)));
    
    // Send error response
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred: ' . $e->getMessage(),
        'completed_steps' => array_keys($completed_steps)
    ]);
}

// Log the end of the request
error_log("--- Track Attendance Request Ended: " . date('Y-m-d H:i:s') . " ---");
?>
