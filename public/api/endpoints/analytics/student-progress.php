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
    $student_id = $_GET['student_id'] ?? null;
    $timeframe = $_GET['timeframe'] ?? 'month'; // month, week, year
    
    if (!$student_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Student ID is required']);
        exit;
    }
    
    // Get user role for access control
    $userQuery = "SELECT role FROM users WHERE id = :user_id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':user_id', $user_id);
    $userStmt->execute();
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    // Check access permissions
    if ($userData['role'] === 'student' && $user_id != $student_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    
    if ($userData['role'] === 'teacher') {
        // Check if teacher teaches this student
        $teacherAccessQuery = "SELECT 1 FROM batch_students bs 
                              JOIN batches b ON bs.batch_id = b.id 
                              WHERE bs.student_id = :student_id AND b.teacher_id = :user_id";
        $teacherAccessStmt = $db->prepare($teacherAccessQuery);
        $teacherAccessStmt->bindParam(':student_id', $student_id);
        $teacherAccessStmt->bindParam(':user_id', $user_id);
        $teacherAccessStmt->execute();
        
        if (!$teacherAccessStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            exit;
        }
    }
    
    // Set date range based on timeframe
    $dateFilter = "";
    switch ($timeframe) {
        case 'week':
            $dateFilter = "AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
            break;
        case 'month':
            $dateFilter = "AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
            break;
        case 'year':
            $dateFilter = "AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
            break;
    }
    
    // Get student basic info
    $studentQuery = "SELECT id, full_name, email FROM users WHERE id = :student_id AND role = 'student'";
    $studentStmt = $db->prepare($studentQuery);
    $studentStmt->bindParam(':student_id', $student_id);
    $studentStmt->execute();
    $studentInfo = $studentStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$studentInfo) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }
    
    // Get quiz performance
    $quizQuery = "SELECT 
                     qa.id,
                     q.title as quiz_title,
                     q.difficulty,
                     qa.score,
                     qa.time_taken,
                     qa.completed_at,
                     RANK() OVER (PARTITION BY qa.quiz_id ORDER BY qa.score DESC) as class_rank
                  FROM quiz_attempts qa
                  JOIN quizzes q ON qa.quiz_id = q.id
                  WHERE qa.user_id = :student_id $dateFilter
                  ORDER BY qa.completed_at DESC";
    
    $quizStmt = $db->prepare($quizQuery);
    $quizStmt->bindParam(':student_id', $student_id);
    $quizStmt->execute();
    $quizProgress = $quizStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get attendance data
    $attendanceQuery = "SELECT 
                           DATE(a.created_at) as date,
                           a.status,
                           b.name as batch_name,
                           COUNT(*) as session_count
                        FROM attendance a
                        JOIN batches b ON a.batch_id = b.id
                        WHERE a.student_id = :student_id $dateFilter
                        GROUP BY DATE(a.created_at), a.status, b.name
                        ORDER BY date DESC";
    
    $attendanceStmt = $db->prepare($attendanceQuery);
    $attendanceStmt->bindParam(':student_id', $student_id);
    $attendanceStmt->execute();
    $attendanceProgress = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate summary statistics
    $summaryQuery = "SELECT 
                        COUNT(qa.id) as total_quizzes,
                        AVG(qa.score) as average_score,
                        MAX(qa.score) as highest_score,
                        MIN(qa.score) as lowest_score,
                        SUM(qa.time_taken) as total_study_time
                     FROM quiz_attempts qa
                     WHERE qa.user_id = :student_id $dateFilter";
    
    $summaryStmt = $db->prepare($summaryQuery);
    $summaryStmt->bindParam(':student_id', $student_id);
    $summaryStmt->execute();
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate attendance rate
    $attendanceSummaryQuery = "SELECT 
                                  COUNT(*) as total_sessions,
                                  COUNT(CASE WHEN status = 'present' THEN 1 END) as present_sessions,
                                  ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*)) * 100, 2) as attendance_rate
                               FROM attendance
                               WHERE student_id = :student_id $dateFilter";
    
    $attendanceSummaryStmt = $db->prepare($attendanceSummaryQuery);
    $attendanceSummaryStmt->bindParam(':student_id', $student_id);
    $attendanceSummaryStmt->execute();
    $attendanceSummary = $attendanceSummaryStmt->fetch(PDO::FETCH_ASSOC);
    
    // Get improvement trends (compare current period with previous)
    $trendQuery = "SELECT 
                      AVG(CASE WHEN qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 " . strtoupper($timeframe) . ") THEN qa.score END) as current_avg,
                      AVG(CASE WHEN qa.completed_at < DATE_SUB(NOW(), INTERVAL 1 " . strtoupper($timeframe) . ") 
                               AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 2 " . strtoupper($timeframe) . ") THEN qa.score END) as previous_avg
                   FROM quiz_attempts qa
                   WHERE qa.user_id = :student_id";
    
    $trendStmt = $db->prepare($trendQuery);
    $trendStmt->bindParam(':student_id', $student_id);
    $trendStmt->execute();
    $trend = $trendStmt->fetch(PDO::FETCH_ASSOC);
    
    $improvement = 0;
    if ($trend['previous_avg'] && $trend['current_avg']) {
        $improvement = round($trend['current_avg'] - $trend['previous_avg'], 2);
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'student_info' => $studentInfo,
        'timeframe' => $timeframe,
        'quiz_progress' => $quizProgress,
        'attendance_progress' => $attendanceProgress,
        'summary' => [
            'total_quizzes' => (int)$summary['total_quizzes'],
            'average_score' => round((float)$summary['average_score'], 2),
            'highest_score' => (int)$summary['highest_score'],
            'lowest_score' => (int)$summary['lowest_score'],
            'total_study_time' => (int)$summary['total_study_time'],
            'attendance_rate' => (float)$attendanceSummary['attendance_rate'],
            'total_sessions' => (int)$attendanceSummary['total_sessions'],
            'present_sessions' => (int)$attendanceSummary['present_sessions'],
            'improvement_trend' => $improvement
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Student progress error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch student progress',
        'error' => $e->getMessage()
    ]);
}
?>
