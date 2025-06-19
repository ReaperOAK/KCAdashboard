<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate authentication
    $user_id = validateToken();
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get request parameters
    $batch_id = $_GET['batch_id'] ?? null;
    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;
    
    if (!$batch_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Batch ID is required']);
        exit;
    }
    
    // Check if user has access to this batch
    $userQuery = "SELECT role FROM users WHERE id = :user_id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':user_id', $user_id);
    $userStmt->execute();
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userData['role'] === 'student') {
        // Students can only view their own batch attendance
        $batchAccessQuery = "SELECT 1 FROM batch_students WHERE batch_id = :batch_id AND student_id = :user_id";
        $batchAccessStmt = $db->prepare($batchAccessQuery);
        $batchAccessStmt->bindParam(':batch_id', $batch_id);
        $batchAccessStmt->bindParam(':user_id', $user_id);
        $batchAccessStmt->execute();
        
        if (!$batchAccessStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            exit;
        }
    } elseif ($userData['role'] === 'teacher') {
        // Teachers can only view batches they teach
        $teacherAccessQuery = "SELECT 1 FROM batches WHERE id = :batch_id AND teacher_id = :user_id";
        $teacherAccessStmt = $db->prepare($teacherAccessQuery);
        $teacherAccessStmt->bindParam(':batch_id', $batch_id);
        $teacherAccessStmt->bindParam(':user_id', $user_id);
        $teacherAccessStmt->execute();
        
        if (!$teacherAccessStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            exit;
        }
    }
    // Admin can view all batches
    
    // Build the query with optional date filters
    $whereClause = "WHERE a.batch_id = :batch_id";
    $params = [':batch_id' => $batch_id];
    
    if ($start_date) {
        $whereClause .= " AND DATE(a.created_at) >= :start_date";
        $params[':start_date'] = $start_date;
    }
    
    if ($end_date) {
        $whereClause .= " AND DATE(a.created_at) <= :end_date";
        $params[':end_date'] = $end_date;
    }
    
    // Get attendance data
    $attendanceQuery = "SELECT 
                           u.id as student_id,
                           u.full_name as student_name,
                           DATE(a.created_at) as date,
                           a.status,
                           a.check_in_time,
                           a.check_out_time,
                           bs.session_id,
                           COALESCE(batch_sessions.title, 'Regular Session') as session_title
                        FROM attendance a
                        JOIN users u ON a.student_id = u.id
                        LEFT JOIN batch_sessions bs ON a.session_id = bs.id
                        LEFT JOIN batch_sessions ON bs.id = batch_sessions.id
                        $whereClause
                        ORDER BY a.created_at DESC, u.full_name ASC";
    
    $attendanceStmt = $db->prepare($attendanceQuery);
    foreach ($params as $key => $value) {
        $attendanceStmt->bindValue($key, $value);
    }
    $attendanceStmt->execute();
    $attendanceData = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get summary statistics
    $summaryQuery = "SELECT 
                        COUNT(*) as total_records,
                        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
                        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
                        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused_count,
                        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*)) * 100, 2) as attendance_rate
                     FROM attendance a
                     $whereClause";
    
    $summaryStmt = $db->prepare($summaryQuery);
    foreach ($params as $key => $value) {
        $summaryStmt->bindValue($key, $value);
    }
    $summaryStmt->execute();
    $summaryData = $summaryStmt->fetch(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'attendance' => $attendanceData,
        'summary' => [
            'total_records' => (int)$summaryData['total_records'],
            'present_count' => (int)$summaryData['present_count'],
            'absent_count' => (int)$summaryData['absent_count'],
            'late_count' => (int)$summaryData['late_count'],
            'excused_count' => (int)$summaryData['excused_count'],
            'attendance_rate' => (float)$summaryData['attendance_rate']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Attendance analytics error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch attendance data',
        'error' => $e->getMessage()
    ]);
}
?>
