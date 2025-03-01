<?php
// Include database and CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../config/Database.php';
require_once '../utils/authorize.php';

try {
    // Authorize request (only teachers and admins can access)
    $user = authorize(['teacher', 'admin']);
    
    // Get parameters
    $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;
    $batch_id = isset($_GET['batch_id']) ? $_GET['batch_id'] : null;
    
    if (!$student_id) {
        throw new Exception("Student ID is required");
    }
    
    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify that the teacher has access to this student
    $access_check_query = "SELECT 1 FROM batch_students bs
                          INNER JOIN batches b ON bs.batch_id = b.id
                          WHERE bs.student_id = :student_id
                          AND b.teacher_id = :teacher_id";
                          
    if ($batch_id) {
        $access_check_query .= " AND bs.batch_id = :batch_id";
    }
    
    $access_stmt = $db->prepare($access_check_query);
    $access_stmt->bindParam(':student_id', $student_id);
    $access_stmt->bindParam(':teacher_id', $user['id']);
    
    if ($batch_id) {
        $access_stmt->bindParam(':batch_id', $batch_id);
    }
    
    $access_stmt->execute();
    
    if ($access_stmt->rowCount() == 0) {
        throw new Exception("You don't have permission to view this student's performance");
    }
    
    // Get student information
    $student_query = "SELECT id, full_name, email FROM users WHERE id = :student_id";
    $student_stmt = $db->prepare($student_query);
    $student_stmt->bindParam(':student_id', $student_id);
    $student_stmt->execute();
    $student = $student_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get attendance statistics
    $attendance_query = "SELECT 
                          COUNT(*) as total_sessions,
                          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                          SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                          SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count
                        FROM 
                          attendance a
                        INNER JOIN 
                          batch_sessions bs ON a.session_id = bs.id
                        WHERE 
                          a.student_id = :student_id";
    
    if ($batch_id) {
        $attendance_query .= " AND a.batch_id = :batch_id";
    }
    
    $attendance_stmt = $db->prepare($attendance_query);
    $attendance_stmt->bindParam(':student_id', $student_id);
    
    if ($batch_id) {
        $attendance_stmt->bindParam(':batch_id', $batch_id);
    }
    
    $attendance_stmt->execute();
    $attendance_stats = $attendance_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate attendance percentage
    $attendance_rate = 0;
    if ($attendance_stats['total_sessions'] > 0) {
        $attendance_rate = round(($attendance_stats['present_count'] / $attendance_stats['total_sessions']) * 100, 1);
    }
    
    // Get quiz performance
    $quiz_query = "SELECT 
                    q.id,
                    q.title,
                    qa.score,
                    qa.completed_at,
                    q.difficulty
                  FROM 
                    quiz_attempts qa
                  INNER JOIN 
                    quizzes q ON qa.quiz_id = q.id
                  WHERE 
                    qa.user_id = :student_id
                  ORDER BY 
                    qa.completed_at DESC";
    
    $quiz_stmt = $db->prepare($quiz_query);
    $quiz_stmt->bindParam(':student_id', $student_id);
    $quiz_stmt->execute();
    $quiz_results = $quiz_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate average quiz score
    $avg_score = 0;
    $quiz_count = count($quiz_results);
    if ($quiz_count > 0) {
        $total_score = 0;
        foreach ($quiz_results as $quiz) {
            $total_score += $quiz['score'];
        }
        $avg_score = round($total_score / $quiz_count, 1);
    }
    
    // Get recent feedback
    $feedback_query = "SELECT 
                        sf.id,
                        sf.rating,
                        sf.comment,
                        sf.areas_of_improvement,
                        sf.strengths,
                        sf.created_at,
                        u.full_name as teacher_name
                      FROM 
                        student_feedback sf
                      INNER JOIN 
                        users u ON sf.teacher_id = u.id
                      WHERE 
                        sf.student_id = :student_id
                      ORDER BY 
                        sf.created_at DESC
                      LIMIT 5";
    
    $feedback_stmt = $db->prepare($feedback_query);
    $feedback_stmt->bindParam(':student_id', $student_id);
    $feedback_stmt->execute();
    $feedback = $feedback_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Prepare monthly attendance data for charts
    $monthly_attendance_query = "SELECT 
                                  DATE_FORMAT(bs.date_time, '%b %Y') as month,
                                  COUNT(*) as total_sessions,
                                  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count
                                FROM 
                                  attendance a
                                INNER JOIN 
                                  batch_sessions bs ON a.session_id = bs.id
                                WHERE 
                                  a.student_id = :student_id
                                  AND bs.date_time >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                                GROUP BY 
                                  DATE_FORMAT(bs.date_time, '%Y-%m')
                                ORDER BY 
                                  DATE_FORMAT(bs.date_time, '%Y-%m')";
    
    $monthly_attendance_stmt = $db->prepare($monthly_attendance_query);
    $monthly_attendance_stmt->bindParam(':student_id', $student_id);
    $monthly_attendance_stmt->execute();
    $monthly_attendance = $monthly_attendance_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format monthly attendance for Chart.js
    $attendance_labels = [];
    $attendance_data = [];
    
    foreach ($monthly_attendance as $month) {
        $attendance_labels[] = $month['month'];
        if ($month['total_sessions'] > 0) {
            $attendance_data[] = round(($month['present_count'] / $month['total_sessions']) * 100, 1);
        } else {
            $attendance_data[] = 0;
        }
    }
    
    // Format quiz results for Chart.js
    $quiz_labels = [];
    $quiz_data = [];
    
    foreach (array_slice($quiz_results, 0, 10) as $quiz) {
        $quiz_labels[] = substr($quiz['title'], 0, 15) . (strlen($quiz['title']) > 15 ? '...' : '');
        $quiz_data[] = $quiz['score'];
    }
    
    // Prepare response data
    $response = [
        'success' => true,
        'student' => $student,
        'attendance' => [
            'rate' => $attendance_rate,
            'present' => (int)$attendance_stats['present_count'],
            'absent' => (int)$attendance_stats['absent_count'],
            'late' => (int)$attendance_stats['late_count'],
            'total' => (int)$attendance_stats['total_sessions']
        ],
        'quiz_performance' => [
            'average' => $avg_score,
            'count' => $quiz_count,
            'detailed' => $quiz_results
        ],
        'feedback' => $feedback,
        'charts' => [
            'monthly_attendance' => [
                'labels' => $attendance_labels,
                'datasets' => [
                    [
                        'label' => 'Attendance %',
                        'data' => $attendance_data,
                        'backgroundColor' => 'rgba(70, 31, 163, 0.5)',
                        'borderColor' => 'rgba(70, 31, 163, 1)',
                        'borderWidth' => 1
                    ]
                ]
            ],
            'quiz_scores' => [
                'labels' => $quiz_labels,
                'datasets' => [
                    [
                        'label' => 'Quiz Scores',
                        'data' => $quiz_data,
                        'backgroundColor' => 'rgba(118, 70, 235, 0.5)',
                        'borderColor' => 'rgba(118, 70, 235, 1)',
                        'borderWidth' => 1
                    ]
                ]
            ]
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
