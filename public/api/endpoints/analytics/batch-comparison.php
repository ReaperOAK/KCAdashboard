<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate authentication
    $user_id = validateToken();
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get user role for access control
    $userQuery = "SELECT role FROM users WHERE id = :user_id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':user_id', $user_id);
    $userStmt->execute();
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    $batch_ids = $data['batch_ids'] ?? [];
    
    if (empty($batch_ids) || !is_array($batch_ids)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Batch IDs array is required']);
        exit;
    }
    
    // Check access permissions for each batch
    if ($userData['role'] === 'teacher') {
        $accessQuery = "SELECT id FROM batches WHERE id IN (" . implode(',', array_fill(0, count($batch_ids), '?')) . ") AND teacher_id = ?";
        $accessStmt = $db->prepare($accessQuery);
        $accessStmt->execute(array_merge($batch_ids, [$user_id]));
        $accessibleBatches = $accessStmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($accessibleBatches) !== count($batch_ids)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied to some batches']);
            exit;
        }
    }
    // Admin can access all batches
    // Students cannot access batch comparison
    elseif ($userData['role'] === 'student') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    
    $placeholders = implode(',', array_fill(0, count($batch_ids), '?'));
    
    // Get batch basic information
    $batchInfoQuery = "SELECT 
                          id,
                          name,
                          level,
                          status,
                          max_students,
                          created_at
                       FROM batches 
                       WHERE id IN ($placeholders)
                       ORDER BY name";
    
    $batchInfoStmt = $db->prepare($batchInfoQuery);
    $batchInfoStmt->execute($batch_ids);
    $batchInfo = $batchInfoStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get student counts for each batch
    $studentCountQuery = "SELECT 
                             batch_id,
                             COUNT(*) as student_count
                          FROM batch_students 
                          WHERE batch_id IN ($placeholders) AND status = 'active'
                          GROUP BY batch_id";
    
    $studentCountStmt = $db->prepare($studentCountQuery);
    $studentCountStmt->execute($batch_ids);
    $studentCounts = $studentCountStmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    // Get attendance statistics for each batch
    $attendanceQuery = "SELECT 
                           a.batch_id,
                           COUNT(*) as total_sessions,
                           COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                           ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) / COUNT(*)) * 100, 2) as attendance_rate
                        FROM attendance a
                        WHERE a.batch_id IN ($placeholders)
                        AND a.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
                        GROUP BY a.batch_id";
    
    $attendanceStmt = $db->prepare($attendanceQuery);
    $attendanceStmt->execute($batch_ids);
    $attendanceStats = $attendanceStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get quiz performance for each batch
    $quizQuery = "SELECT 
                     b.id as batch_id,
                     COUNT(qa.id) as total_attempts,
                     AVG(qa.score) as average_score,
                     MAX(qa.score) as highest_score,
                     MIN(qa.score) as lowest_score
                  FROM batches b
                  JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'active'
                  LEFT JOIN quiz_attempts qa ON bs.student_id = qa.user_id
                  AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
                  WHERE b.id IN ($placeholders)
                  GROUP BY b.id";
    
    $quizStmt = $db->prepare($quizQuery);
    $quizStmt->execute($batch_ids);
    $quizStats = $quizStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Combine all data
    $comparison = [];
    foreach ($batchInfo as $batch) {
        $batch_id = $batch['id'];
        
        // Find corresponding stats
        $attendance = array_filter($attendanceStats, function($item) use ($batch_id) {
            return $item['batch_id'] == $batch_id;
        });
        $attendance = reset($attendance) ?: ['attendance_rate' => 0, 'total_sessions' => 0, 'present_count' => 0];
        
        $quiz = array_filter($quizStats, function($item) use ($batch_id) {
            return $item['batch_id'] == $batch_id;
        });
        $quiz = reset($quiz) ?: ['total_attempts' => 0, 'average_score' => 0, 'highest_score' => 0, 'lowest_score' => 0];
        
        $comparison[] = [
            'batch_id' => $batch['id'],
            'batch_name' => $batch['name'],
            'level' => $batch['level'],
            'status' => $batch['status'],
            'max_students' => (int)$batch['max_students'],
            'current_students' => (int)($studentCounts[$batch_id] ?? 0),
            'fill_rate' => round((($studentCounts[$batch_id] ?? 0) / $batch['max_students']) * 100, 2),
            'attendance_rate' => (float)$attendance['attendance_rate'],
            'total_sessions' => (int)$attendance['total_sessions'],
            'present_count' => (int)$attendance['present_count'],
            'quiz_attempts' => (int)$quiz['total_attempts'],
            'average_quiz_score' => round((float)$quiz['average_score'], 2),
            'highest_quiz_score' => (int)$quiz['highest_score'],
            'lowest_quiz_score' => (int)$quiz['lowest_score'],
            'created_at' => $batch['created_at']
        ];
    }
    
    // Calculate overall comparison metrics
    $totalStudents = array_sum($studentCounts);
    $avgAttendanceRate = count($attendanceStats) > 0 ? 
        array_sum(array_column($attendanceStats, 'attendance_rate')) / count($attendanceStats) : 0;
    $avgQuizScore = count($quizStats) > 0 ? 
        array_sum(array_column($quizStats, 'average_score')) / count($quizStats) : 0;
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'comparison' => $comparison,
        'summary' => [
            'total_batches' => count($batch_ids),
            'total_students' => $totalStudents,
            'average_attendance_rate' => round($avgAttendanceRate, 2),
            'average_quiz_score' => round($avgQuizScore, 2),
            'comparison_period' => 'Last 30 days'
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Batch comparison error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to compare batches',
        'error' => $e->getMessage()
    ]);
}
?>
