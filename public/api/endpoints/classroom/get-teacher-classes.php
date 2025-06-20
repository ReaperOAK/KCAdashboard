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
    // Use try-catch to prevent silent failures
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

    try {        $database = new Database();
        $db = $database->getConnection();
        
        $teacher_id = $user_data['id'];
        
        // Simplified query to avoid complex subquery issues
        $stmt = $db->prepare("
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.status,
                c.created_at
            FROM classrooms c
            WHERE c.teacher_id = :teacher_id
        ");
        
        $stmt->bindParam(':teacher_id', $teacher_id);
        $stmt->execute();
        
        $classrooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get additional data in separate queries to avoid complex query errors
        foreach ($classrooms as &$classroom) {
            // Get student count
            $count_stmt = $db->prepare("
                SELECT COUNT(student_id) as count
                FROM classroom_students
                WHERE classroom_id = :classroom_id
            ");
            $count_stmt->bindParam(':classroom_id', $classroom['id']);
            $count_stmt->execute();
            $count_data = $count_stmt->fetch(PDO::FETCH_ASSOC);
            $classroom['student_count'] = $count_data ? $count_data['count'] : 0;
            
            // Get next session
            $session_stmt = $db->prepare("
                SELECT date_time
                FROM batch_sessions
                WHERE batch_id = :classroom_id 
                AND date_time > NOW()
                ORDER BY date_time ASC
                LIMIT 1
            ");
            $session_stmt->bindParam(':classroom_id', $classroom['id']);
            $session_stmt->execute();
            $session_data = $session_stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($session_data && $session_data['date_time']) {
                $datetime = new DateTime($session_data['date_time']);
                $classroom['next_session'] = $datetime->format('M d, Y h:i A');
            } else {
                $classroom['next_session'] = null;
            }
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'classes' => $classrooms
        ]);
        
    } catch (PDOException $e) {
        // Handle database errors specifically
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    }
    
} catch (Exception $e) {
    // Catch any other errors
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
