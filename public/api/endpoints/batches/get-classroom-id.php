<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    require_once '../../config/Database.php';
    require_once '../../models/Batch.php';
    require_once '../../utils/authorize.php';

    // Verify user authorization
    $user = authorize(['student', 'teacher', 'admin']);
    
    // Get batch ID from query parameters
    if (!isset($_GET['batch_id'])) {
        throw new Exception('Batch ID is required');
    }
    
    $batch_id = $_GET['batch_id'];
    
    $database = new Database();
    $db = $database->getConnection();
    
    // For students, verify they are in the batch
    if ($user['role'] === 'student') {
        $query = "SELECT bs.batch_id FROM batch_students bs WHERE bs.batch_id = :batch_id AND bs.student_id = :student_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':batch_id', $batch_id);
        $stmt->bindParam(':student_id', $user['id']);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('You are not enrolled in this batch');
        }
    }
    
    // For teachers, verify they own the batch
    if ($user['role'] === 'teacher') {
        $query = "SELECT id FROM batches WHERE id = :batch_id AND teacher_id = :teacher_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':batch_id', $batch_id);
        $stmt->bindParam(':teacher_id', $user['id']);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('You do not have permission to access this batch');
        }
    }
    
    // Get the classroom ID for this batch
    $query = "SELECT c.id as classroom_id, c.name as classroom_name
             FROM classrooms c
             INNER JOIN batches b ON b.name = c.name AND b.teacher_id = c.teacher_id
             WHERE b.id = :batch_id
             LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':batch_id', $batch_id);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        throw new Exception('Classroom not found for this batch');
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'batch_id' => $batch_id,
            'classroom_id' => $result['classroom_id'],
            'classroom_name' => $result['classroom_name']
        ]
    ]);
    
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
