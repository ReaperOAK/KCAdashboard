<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';

// Verify token and get user
$user_data = verifyToken();

if (!$user_data) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Get session ID from query params
$session_id = isset($_GET['session_id']) ? intval($_GET['session_id']) : null;

if (!$session_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Session ID is required'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // First, get the classroom/batch ID and verify access
    $stmt = $db->prepare("
        SELECT bs.batch_id, c.teacher_id 
        FROM batch_sessions bs
        JOIN classrooms c ON bs.batch_id = c.id
        WHERE bs.id = :session_id
    ");
    
    $stmt->bindParam(':session_id', $session_id);
    $stmt->execute();
    
    $session_info = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$session_info) {
        echo json_encode([
            'success' => false,
            'message' => 'Session not found'
        ]);
        exit;
    }
    
    // For teachers, verify they own this classroom
    if ($user_data['role'] === 'teacher' && $session_info['teacher_id'] != $user_data['id']) {
        echo json_encode([
            'success' => false,
            'message' => 'You do not have permission to access this session'
        ]);
        exit;
    }
    
    // Get all students in this classroom
    $stmt = $db->prepare("
        SELECT 
            u.id,
            u.full_name,
            u.email,
            u.profile_picture,
            COALESCE(a.status, 'absent') as attendance_status,
            a.notes as attendance_notes
        FROM classroom_students cs
        JOIN users u ON cs.student_id = u.id
        LEFT JOIN attendance a ON (
            a.student_id = u.id 
            AND a.session_id = :session_id
        )
        WHERE cs.classroom_id = :classroom_id
        ORDER BY u.full_name
    ");
    
    $classroom_id = $session_info['batch_id'];
    
    $stmt->bindParam(':session_id', $session_id);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check if attendance has been taken for this session
    $stmt = $db->prepare("
        SELECT attendance_taken 
        FROM batch_sessions
        WHERE id = :session_id
    ");
    
    $stmt->bindParam(':session_id', $session_id);
    $stmt->execute();
    
    $session_data = $stmt->fetch(PDO::FETCH_ASSOC);
    $attendance_taken = (bool) $session_data['attendance_taken'];
    
    echo json_encode([
        'success' => true,
        'students' => $students,
        'attendance_taken' => $attendance_taken
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching students: ' . $e->getMessage()
    ]);
}
?>
