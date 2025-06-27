<?php
// Include database and CORS headers
require_once '../../config/cors.php';

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
    
    // Get the selected batch ID (if any)
    $batch_id = isset($_GET['batch']) ? $_GET['batch'] : 'all';
    
    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all batches taught by this teacher
    $batch_query = "SELECT id, name FROM batches WHERE teacher_id = :teacher_id";
    $batch_stmt = $db->prepare($batch_query);
    $batch_stmt->bindParam(':teacher_id', $teacher_id);
    $batch_stmt->execute();
    $batches = $batch_stmt->fetchAll(PDO::FETCH_ASSOC);
      // Prepare response
    $response = [
        'success' => true,
        'batches' => $batches,
        'stats' => [
            'attendanceData' => generateAttendanceData($db, $teacher_id, $batch_id),
            'performanceData' => generatePerformanceData($db, $teacher_id, $batch_id),
            'quizStats' => generateQuizStats($db, $teacher_id, $batch_id),
            'summaryStats' => generateSummaryStats($db, $teacher_id, $batch_id)
        ]
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

// Helper function to generate attendance data for charts
function generateAttendanceData($db, $teacher_id, $batch_id) {
    try {
        // Get last 10 sessions
        $batch_condition = ($batch_id != 'all') ? "AND bs.batch_id = :batch_id" : "";
        
        $query = "SELECT 
                    bs.title as session_name,
                    DATE_FORMAT(bs.date_time, '%d %b') as session_date,
                    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
                    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count
                  FROM 
                    batch_sessions bs
                  LEFT JOIN 
                    attendance a ON bs.id = a.session_id
                  INNER JOIN 
                    batches b ON bs.batch_id = b.id
                  WHERE 
                    b.teacher_id = :teacher_id
                    $batch_condition
                    AND bs.date_time <= NOW()
                  GROUP BY 
                    bs.id
                  ORDER BY 
                    bs.date_time DESC
                  LIMIT 10";
                  
        $stmt = $db->prepare($query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        
        if ($batch_id != 'all') {
            $stmt->bindParam(':batch_id', $batch_id);
        }
        
        $stmt->execute();
        $attendance_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format for Chart.js
        $labels = [];
        $present_data = [];
        $absent_data = [];
        $late_data = [];
        
        foreach (array_reverse($attendance_data) as $record) {
            $labels[] = $record['session_date'];
            $present_data[] = (int)$record['present_count']; // Ensure integers
            $absent_data[] = (int)$record['absent_count'];
            $late_data[] = (int)$record['late_count'];
        }
        
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Present',
                    'data' => $present_data,
                    'borderColor' => 'rgb(75, 192, 192)',
                    'backgroundColor' => 'rgba(75, 192, 192, 0.5)',
                    'fill' => false,
                    'tension' => 0.1
                ],
                [
                    'label' => 'Absent',
                    'data' => $absent_data,
                    'borderColor' => 'rgb(255, 99, 132)',
                    'backgroundColor' => 'rgba(255, 99, 132, 0.5)',
                    'fill' => false,
                    'tension' => 0.1
                ],
                [
                    'label' => 'Late',
                    'data' => $late_data,
                    'borderColor' => 'rgb(255, 205, 86)',
                    'backgroundColor' => 'rgba(255, 205, 86, 0.5)',
                    'fill' => false,
                    'tension' => 0.1
                ]
            ]
        ];
    } catch (Exception $e) {
        // Return empty data structure on error
        error_log("Error in generateAttendanceData: " . $e->getMessage());
        return [
            'labels' => [],
            'datasets' => [
                ['label' => 'Present', 'data' => [], 'borderColor' => 'rgb(75, 192, 192)', 'backgroundColor' => 'rgba(75, 192, 192, 0.5)', 'fill' => false, 'tension' => 0.1],
                ['label' => 'Absent', 'data' => [], 'borderColor' => 'rgb(255, 99, 132)', 'backgroundColor' => 'rgba(255, 99, 132, 0.5)', 'fill' => false, 'tension' => 0.1],
                ['label' => 'Late', 'data' => [], 'borderColor' => 'rgb(255, 205, 86)', 'backgroundColor' => 'rgba(255, 205, 86, 0.5)', 'fill' => false, 'tension' => 0.1]
            ]
        ];
    }
}

// Helper function to generate performance data
function generatePerformanceData($db, $teacher_id, $batch_id) {
    try {
        // Batch condition for SQL
        $batch_condition = ($batch_id != 'all') ? "AND b.id = :batch_id" : "";
        
        // Get average quiz scores for students in teacher's batches
        $query = "SELECT 
                    u.full_name,
                    COALESCE(AVG(qa.score), 0) as avg_score
                  FROM 
                    users u
                  INNER JOIN 
                    batch_students bs ON u.id = bs.student_id
                  INNER JOIN 
                    batches b ON bs.batch_id = b.id
                  LEFT JOIN 
                    quiz_attempts qa ON u.id = qa.user_id
                  WHERE 
                    b.teacher_id = :teacher_id
                    $batch_condition
                    AND bs.status = 'active'
                  GROUP BY 
                    u.id
                  ORDER BY 
                    avg_score DESC
                  LIMIT 10";
                  
        $stmt = $db->prepare($query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        
        if ($batch_id != 'all') {
            $stmt->bindParam(':batch_id', $batch_id);
        }
        
        $stmt->execute();
        $performance_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format for Chart.js
        $labels = [];
        $scores = [];
        $backgroundColors = [];
        
        foreach ($performance_data as $record) {
            $labels[] = $record['full_name'];
            $scores[] = (float)$record['avg_score']; // Ensure numeric values
            // Generate a unique color for each student
            $backgroundColors[] = 'rgba(' . rand(100, 200) . ', ' . rand(100, 200) . ', ' . rand(100, 200) . ', 0.5)';
        }
        
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Avg Quiz Score',
                    'data' => $scores,
                    'backgroundColor' => $backgroundColors,
                    'borderColor' => 'rgba(70, 31, 163, 1)',
                    'borderWidth' => 1
                ]
            ]
        ];
    } catch (Exception $e) {
        // Return empty data structure on error
        error_log("Error in generatePerformanceData: " . $e->getMessage());
        return [
            'labels' => [],
            'datasets' => [
                ['label' => 'Avg Quiz Score', 'data' => [], 'backgroundColor' => [], 'borderColor' => 'rgba(70, 31, 163, 1)', 'borderWidth' => 1]
            ]
        ];
    }
}

// Helper function to generate quiz statistics
function generateQuizStats($db, $teacher_id, $batch_id) {
    try {
        // Get distribution of quiz scores
        $query = "SELECT 
                    CASE
                        WHEN qa.score < 40 THEN 'Failed (<40%)'
                        WHEN qa.score < 60 THEN 'Basic (40-59%)'
                        WHEN qa.score < 75 THEN 'Satisfactory (60-74%)'
                        WHEN qa.score < 90 THEN 'Good (75-89%)'
                        ELSE 'Excellent (90-100%)'
                    END as score_range,
                    COUNT(*) as count
                  FROM 
                    quiz_attempts qa
                  INNER JOIN 
                    quizzes q ON qa.quiz_id = q.id
                  WHERE 
                    q.created_by = :teacher_id";
                    
        if ($batch_id != 'all') {
            $query .= " AND qa.user_id IN (
                          SELECT student_id FROM batch_students WHERE batch_id = :batch_id
                        )";
        }
        
        $query .= " GROUP BY score_range";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        
        if ($batch_id != 'all') {
            $stmt->bindParam(':batch_id', $batch_id);
        }
        
        $stmt->execute();
        $quiz_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format for Chart.js
        $labels = [];
        $data = [];
        $backgroundColor = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)'
        ];
        
        foreach ($quiz_stats as $record) {
            $labels[] = $record['score_range'];
            $data[] = (int)$record['count']; // Ensure integers
        }
        
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Quiz Score Distribution',
                    'data' => $data,
                    'backgroundColor' => $backgroundColor,
                    'borderColor' => 'rgba(255, 255, 255, 0.8)',
                    'borderWidth' => 1
                ]
            ]
        ];
    } catch (Exception $e) {
        // Return empty data structure on error
        error_log("Error in generateQuizStats: " . $e->getMessage());
        return [
            'labels' => [],
            'datasets' => [
                ['label' => 'Quiz Score Distribution', 'data' => [], 'backgroundColor' => [], 'borderColor' => 'rgba(255, 255, 255, 0.8)', 'borderWidth' => 1]
            ]        ];
    }
}

// Helper function to generate summary statistics
function generateSummaryStats($db, $teacher_id, $batch_id) {
    try {
        $batch_condition = ($batch_id != 'all') ? "AND b.id = :batch_id" : "";
        
        // Calculate average attendance
        $attendance_query = "SELECT 
                               AVG(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 as avg_attendance
                             FROM batch_sessions bs
                             INNER JOIN batches b ON bs.batch_id = b.id
                             LEFT JOIN attendance a ON bs.id = a.session_id
                             WHERE b.teacher_id = :teacher_id
                             $batch_condition
                             AND bs.date_time <= NOW()";
        
        $stmt = $db->prepare($attendance_query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        if ($batch_id != 'all') {
            $stmt->bindParam(':batch_id', $batch_id);
        }
        $stmt->execute();
        $attendance_result = $stmt->fetch(PDO::FETCH_ASSOC);
        $avg_attendance = round($attendance_result['avg_attendance'] ?? 0, 1);
        
        // Count active students
        $student_query = "SELECT COUNT(DISTINCT bs.student_id) as active_students
                          FROM batch_students bs
                          INNER JOIN batches b ON bs.batch_id = b.id
                          WHERE b.teacher_id = :teacher_id
                          $batch_condition
                          AND bs.status = 'active'";
        
        $stmt = $db->prepare($student_query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        if ($batch_id != 'all') {
            $stmt->bindParam(':batch_id', $batch_id);
        }
        $stmt->execute();
        $student_result = $stmt->fetch(PDO::FETCH_ASSOC);
        $active_students = $student_result['active_students'] ?? 0;
        
        // Calculate average quiz score
        $quiz_query = "SELECT AVG(qa.score) as avg_quiz_score
                       FROM quiz_attempts qa
                       INNER JOIN quizzes q ON qa.quiz_id = q.id
                       WHERE q.created_by = :teacher_id";
        
        if ($batch_id != 'all') {
            $quiz_query .= " AND qa.user_id IN (
                              SELECT student_id FROM batch_students WHERE batch_id = :batch_id
                            )";
        }
        
        $stmt = $db->prepare($quiz_query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        if ($batch_id != 'all') {
            $stmt->bindParam(':batch_id', $batch_id);
        }
        $stmt->execute();
        $quiz_result = $stmt->fetch(PDO::FETCH_ASSOC);
        $avg_quiz_score = round($quiz_result['avg_quiz_score'] ?? 0, 1);
        
        // Count classes this month
        $class_query = "SELECT COUNT(*) as classes_this_month
                        FROM batch_sessions bs
                        INNER JOIN batches b ON bs.batch_id = b.id
                        WHERE b.teacher_id = :teacher_id
                        $batch_condition
                        AND MONTH(bs.date_time) = MONTH(NOW())
                        AND YEAR(bs.date_time) = YEAR(NOW())";
        
        $stmt = $db->prepare($class_query);
        $stmt->bindParam(':teacher_id', $teacher_id);
        if ($batch_id != 'all') {
            $stmt->bindParam(':batch_id', $batch_id);
        }
        $stmt->execute();
        $class_result = $stmt->fetch(PDO::FETCH_ASSOC);
        $classes_this_month = $class_result['classes_this_month'] ?? 0;
        
        return [
            'avgAttendance' => $avg_attendance,
            'activeStudents' => (int)$active_students,
            'avgQuizScore' => $avg_quiz_score,
            'classesThisMonth' => (int)$classes_this_month
        ];
        
    } catch (Exception $e) {
        error_log("Error in generateSummaryStats: " . $e->getMessage());
        return [
            'avgAttendance' => 0,
            'activeStudents' => 0,
            'avgQuizScore' => 0,
            'classesThisMonth' => 0
        ];
    }
}
?>
