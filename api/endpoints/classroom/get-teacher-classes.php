<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

// Verify token and get user
$user_data = verifyToken();

if (!$user_data) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Only teachers can access this endpoint
if ($user_data['role'] !== 'teacher') {
    echo json_encode([
        'success' => false,
        'message' => 'Permission denied'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $teacher_id = $user_data['id'];
    
    // Get all classrooms owned by this teacher
    $stmt = $db->prepare("
        SELECT 
            c.id, 
            c.name, 
            c.description, 
            c.status,
            c.created_at,
            COUNT(cs.student_id) as student_count,
            (
                SELECT MIN(bs.date_time)
                FROM batch_sessions bs
                WHERE bs.batch_id = c.id AND bs.date_time > NOW()
                ORDER BY bs.date_time ASC
                LIMIT 1
            ) as next_session
        FROM classrooms c
        LEFT JOIN classroom_students cs ON c.id = cs.classroom_id
        WHERE c.teacher_id = :teacher_id
        GROUP BY c.id
    ");
    
    $stmt->bindParam(':teacher_id', $teacher_id);
    $stmt->execute();
    
    $classrooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates nicely
    foreach ($classrooms as &$classroom) {
        if ($classroom['next_session']) {
            $datetime = new DateTime($classroom['next_session']);
            $classroom['next_session'] = $datetime->format('M d, Y h:i A');
        }
    }
    
    echo json_encode([
        'success' => true,
        'classes' => $classrooms
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching classrooms: ' . $e->getMessage()
    ]);
}
?>
