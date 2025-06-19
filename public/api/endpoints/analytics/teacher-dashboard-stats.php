<?php
// Include database and CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Fix the paths - go up two directories from /endpoints/analytics/ to reach /api/
require_once '../../config/Database.php';
require_once '../../utils/authorize.php';

try {
    // Authorize request (only teachers and admins can access)
    $user = authorize(['teacher', 'admin']);
    $teacher_id = $user['id'];
    
    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Get total students taught by this teacher
    $student_query = "SELECT COUNT(DISTINCT bs.student_id) as total_students
                      FROM batch_students bs
                      INNER JOIN batches b ON bs.batch_id = b.id
                      WHERE b.teacher_id = :teacher_id 
                      AND bs.status = 'active'";
    $student_stmt = $db->prepare($student_query);
    $student_stmt->bindParam(':teacher_id', $teacher_id);
    $student_stmt->execute();
    $total_students = $student_stmt->fetch(PDO::FETCH_COLUMN);
    
    // Get active classes (batches)
    $active_batch_query = "SELECT COUNT(*) as active_classes
                          FROM batches 
                          WHERE teacher_id = :teacher_id 
                          AND status = 'active'";
    $active_batch_stmt = $db->prepare($active_batch_query);
    $active_batch_stmt->bindParam(':teacher_id', $teacher_id);
    $active_batch_stmt->execute();
    $active_classes = $active_batch_stmt->fetch(PDO::FETCH_COLUMN);
      // Get upcoming classes (future sessions)
    $upcoming_query = "SELECT COUNT(*) as upcoming_classes
                      FROM batch_sessions bs
                      INNER JOIN batches b ON bs.batch_id = b.id
                      WHERE b.teacher_id = :teacher_id 
                      AND bs.date_time > NOW()";
    $upcoming_stmt = $db->prepare($upcoming_query);
    $upcoming_stmt->bindParam(':teacher_id', $teacher_id);
    $upcoming_stmt->execute();
    $upcoming_classes = $upcoming_stmt->fetch(PDO::FETCH_COLUMN);
    
    // Get completed classes (past sessions with attendance taken)
    $completed_query = "SELECT COUNT(*) as completed_classes
                       FROM batch_sessions bs
                       INNER JOIN batches b ON bs.batch_id = b.id
                       WHERE b.teacher_id = :teacher_id 
                       AND bs.date_time < NOW()
                       AND bs.attendance_taken = 1";
    $completed_stmt = $db->prepare($completed_query);
    $completed_stmt->bindParam(':teacher_id', $teacher_id);
    $completed_stmt->execute();
    $completed_classes = $completed_stmt->fetch(PDO::FETCH_COLUMN);
      // Get recent activities
    $recent_activities_query = "SELECT 
                                  'session' as activity_type,
                                  bs.title as title,
                                  b.name as batch_name,
                                  bs.date_time as date_time,
                                  CASE 
                                    WHEN bs.date_time > NOW() THEN 'upcoming'
                                    WHEN bs.date_time < NOW() AND bs.attendance_taken = 1 THEN 'completed'
                                    WHEN bs.date_time < NOW() AND bs.attendance_taken = 0 THEN 'pending'
                                    ELSE 'in_progress'
                                  END as status
                                FROM batch_sessions bs
                                INNER JOIN batches b ON bs.batch_id = b.id
                                WHERE b.teacher_id = :teacher_id
                                ORDER BY bs.date_time DESC
                                LIMIT 5";
    $recent_stmt = $db->prepare($recent_activities_query);
    $recent_stmt->bindParam(':teacher_id', $teacher_id);
    $recent_stmt->execute();
    $recent_activities = $recent_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $response = [
        'success' => true,
        'stats' => [
            'totalStudents' => (int)$total_students,
            'activeClasses' => (int)$active_classes,
            'upcomingClasses' => (int)$upcoming_classes,
            'completedClasses' => (int)$completed_classes
        ],
        'recentActivities' => $recent_activities
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)
    ]);
}
?>
