<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once '../../config/Database.php';
    require_once '../../middleware/auth.php';
    
    // Get JSON request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Log received data for debugging
    error_log('Received attendance data: ' . json_encode($data));
    
    // Verify token and get user
    $user_data = verifyToken();
    
    if (!$user_data || $user_data['role'] !== 'teacher') {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit;
    }
    
    // Validate required fields
    if (!isset($data['session_id']) || !isset($data['attendance']) || !is_array($data['attendance'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields'
        ]);
        exit;
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Get session and classroom details
        $stmt = $db->prepare("
            SELECT bs.batch_id, c.teacher_id
            FROM batch_sessions bs
            JOIN classrooms c ON bs.batch_id = c.id
            WHERE bs.id = :session_id
        ");
        
        $stmt->bindParam(':session_id', $data['session_id']);
        $stmt->execute();
        
        $session_info = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$session_info) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Session not found'
            ]);
            exit;
        }
        
        // Verify teacher owns this classroom
        if ($session_info['teacher_id'] != $user_data['id']) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'You do not have permission to mark attendance for this session'
            ]);
            exit;
        }
        
        $batch_id = $session_info['batch_id'];
        $session_id = $data['session_id'];
        
        // Begin transaction
        $db->beginTransaction();
        
        // First, delete any existing attendance records for this session
        $stmt = $db->prepare("
            DELETE FROM attendance 
            WHERE session_id = :session_id
        ");
        $stmt->bindParam(':session_id', $session_id);
        $stmt->execute();
        
        // Insert new attendance records
        $insert_stmt = $db->prepare("
            INSERT INTO attendance (
                student_id, batch_id, session_id, status,
                marked_by, notes, created_at, updated_at
            ) VALUES (
                :student_id, :batch_id, :session_id, :status,
                :marked_by, :notes, NOW(), NOW()
            )
        ");
        
        foreach ($data['attendance'] as $record) {
            if (!isset($record['student_id']) || !isset($record['status'])) {
                continue;
            }
            
            $student_id = $record['student_id'];
            $status = $record['status'];
            $notes = isset($record['notes']) ? $record['notes'] : null;
            
            $insert_stmt->bindParam(':student_id', $student_id);
            $insert_stmt->bindParam(':batch_id', $batch_id);
            $insert_stmt->bindParam(':session_id', $session_id);
            $insert_stmt->bindParam(':status', $status);
            $insert_stmt->bindParam(':marked_by', $user_data['id']);
            $insert_stmt->bindParam(':notes', $notes);
            
            $insert_stmt->execute();
        }
        
        // Mark attendance as taken in the batch_sessions table
        $stmt = $db->prepare("
            UPDATE batch_sessions
            SET attendance_taken = 1
            WHERE id = :session_id
        ");
        $stmt->bindParam(':session_id', $session_id);
        $stmt->execute();
        
        // Commit transaction
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Attendance recorded successfully'
        ]);
        
    } catch (PDOException $e) {
        // Roll back transaction on error
        if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
        }
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage(),
            'error_code' => $e->getCode(),
            'error_trace' => $e->getTraceAsString()
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error recording attendance: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
