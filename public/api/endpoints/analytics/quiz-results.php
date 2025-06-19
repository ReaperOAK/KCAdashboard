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
    $quiz_id = $_GET['quiz_id'] ?? null;
    
    // Get user role for access control
    $userQuery = "SELECT role FROM users WHERE id = :user_id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':user_id', $user_id);
    $userStmt->execute();
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    // Build base query
    $baseQuery = "SELECT 
                     qa.id as attempt_id,
                     qa.user_id,
                     u.full_name as student_name,
                     qa.quiz_id,
                     q.title as quiz_title,
                     q.difficulty,
                     qa.score,
                     qa.time_taken,
                     qa.completed_at,
                     b.name as batch_name,
                     b.id as batch_id
                  FROM quiz_attempts qa
                  JOIN users u ON qa.user_id = u.id
                  JOIN quizzes q ON qa.quiz_id = q.id
                  LEFT JOIN batch_students bs ON u.id = bs.student_id AND bs.status = 'active'
                  LEFT JOIN batches b ON bs.batch_id = b.id";
    
    $whereConditions = [];
    $params = [];
    
    // Apply access control
    if ($userData['role'] === 'student') {
        $whereConditions[] = "qa.user_id = :user_id";
        $params[':user_id'] = $user_id;
    } elseif ($userData['role'] === 'teacher') {
        $whereConditions[] = "(q.created_by = :user_id OR b.teacher_id = :user_id)";
        $params[':user_id'] = $user_id;
    }
    // Admin can see all results
    
    // Apply filters
    if ($batch_id) {
        $whereConditions[] = "b.id = :batch_id";
        $params[':batch_id'] = $batch_id;
    }
    
    if ($quiz_id) {
        $whereConditions[] = "qa.quiz_id = :quiz_id";
        $params[':quiz_id'] = $quiz_id;
    }
    
    // Construct final query
    $finalQuery = $baseQuery;
    if (!empty($whereConditions)) {
        $finalQuery .= " WHERE " . implode(" AND ", $whereConditions);
    }
    $finalQuery .= " ORDER BY qa.completed_at DESC";
    
    $stmt = $db->prepare($finalQuery);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get summary statistics
    $summaryQuery = "SELECT 
                        COUNT(*) as total_attempts,
                        AVG(score) as average_score,
                        MAX(score) as highest_score,
                        MIN(score) as lowest_score,
                        AVG(time_taken) as average_time,
                        COUNT(DISTINCT user_id) as unique_students,
                        COUNT(DISTINCT quiz_id) as unique_quizzes
                     FROM quiz_attempts qa
                     JOIN users u ON qa.user_id = u.id
                     JOIN quizzes q ON qa.quiz_id = q.id
                     LEFT JOIN batch_students bs ON u.id = bs.student_id AND bs.status = 'active'
                     LEFT JOIN batches b ON bs.batch_id = b.id";
    
    if (!empty($whereConditions)) {
        $summaryQuery .= " WHERE " . implode(" AND ", $whereConditions);
    }
    
    $summaryStmt = $db->prepare($summaryQuery);
    foreach ($params as $key => $value) {
        $summaryStmt->bindValue($key, $value);
    }
    $summaryStmt->execute();
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);
    
    // Get quiz-wise statistics
    $quizStatsQuery = "SELECT 
                          q.id as quiz_id,
                          q.title,
                          q.difficulty,
                          COUNT(qa.id) as attempt_count,
                          AVG(qa.score) as average_score,
                          MAX(qa.score) as highest_score,
                          MIN(qa.score) as lowest_score
                       FROM quizzes q
                       LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
                       LEFT JOIN users u ON qa.user_id = u.id
                       LEFT JOIN batch_students bs ON u.id = bs.student_id AND bs.status = 'active'
                       LEFT JOIN batches b ON bs.batch_id = b.id";
    
    if (!empty($whereConditions)) {
        $quizStatsQuery .= " WHERE " . implode(" AND ", $whereConditions);
    }
    
    $quizStatsQuery .= " GROUP BY q.id, q.title, q.difficulty
                         HAVING attempt_count > 0
                         ORDER BY average_score DESC";
    
    $quizStatsStmt = $db->prepare($quizStatsQuery);
    foreach ($params as $key => $value) {
        $quizStatsStmt->bindValue($key, $value);
    }
    $quizStatsStmt->execute();
    $quizStats = $quizStatsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'results' => $results,
        'summary' => [
            'total_attempts' => (int)$summary['total_attempts'],
            'average_score' => round((float)$summary['average_score'], 2),
            'highest_score' => (int)$summary['highest_score'],
            'lowest_score' => (int)$summary['lowest_score'],
            'average_time' => round((float)$summary['average_time'], 2),
            'unique_students' => (int)$summary['unique_students'],
            'unique_quizzes' => (int)$summary['unique_quizzes']
        ],
        'quiz_statistics' => $quizStats
    ]);
    
} catch (Exception $e) {
    error_log("Quiz results analytics error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch quiz results',
        'error' => $e->getMessage()
    ]);
}
?>
