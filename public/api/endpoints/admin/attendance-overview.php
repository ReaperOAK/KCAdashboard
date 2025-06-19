<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate authentication
    $user_id = validateToken();
    
    // Get user role
    $database = new Database();
    $db = $database->getConnection();
    
    $userQuery = "SELECT role FROM users WHERE id = :user_id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':user_id', $user_id);
    $userStmt->execute();
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userData || $userData['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    
    // Get attendance overview statistics
    $stats = [];
    
    // Overall attendance rate for the current month
    $currentMonth = date('Y-m');
    $monthlyQuery = "SELECT 
                        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                        COUNT(*) as total_count,
                        ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*)) * 100, 2) as attendance_rate
                     FROM attendance 
                     WHERE DATE_FORMAT(created_at, '%Y-%m') = :current_month";
    $monthlyStmt = $db->prepare($monthlyQuery);
    $monthlyStmt->bindParam(':current_month', $currentMonth);
    $monthlyStmt->execute();
    $monthlyData = $monthlyStmt->fetch(PDO::FETCH_ASSOC);
    
    $stats['monthlyAttendance'] = [
        'rate' => (float)($monthlyData['attendance_rate'] ?? 0),
        'present' => (int)($monthlyData['present_count'] ?? 0),
        'total' => (int)($monthlyData['total_count'] ?? 0)
    ];
    
    // Attendance by batch for current month
    $batchQuery = "SELECT b.name as batch_name, b.id as batch_id,
                      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                      COUNT(a.id) as total_count,
                      ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) / COUNT(a.id)) * 100, 2) as attendance_rate
                   FROM batches b
                   LEFT JOIN attendance a ON b.id = a.batch_id 
                   AND DATE_FORMAT(a.created_at, '%Y-%m') = :current_month
                   WHERE b.status = 'active'
                   GROUP BY b.id, b.name
                   ORDER BY attendance_rate DESC";
    $batchStmt = $db->prepare($batchQuery);
    $batchStmt->bindParam(':current_month', $currentMonth);
    $batchStmt->execute();
    $stats['batchAttendance'] = $batchStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Students with low attendance (below 75%)
    $lowAttendanceQuery = "SELECT u.full_name, u.id as student_id, b.name as batch_name,
                              COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                              COUNT(a.id) as total_sessions,
                              ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) / COUNT(a.id)) * 100, 2) as attendance_rate
                           FROM users u
                           JOIN batch_students bs ON u.id = bs.student_id AND bs.status = 'active'
                           JOIN batches b ON bs.batch_id = b.id
                           LEFT JOIN attendance a ON u.id = a.student_id AND a.batch_id = b.id
                           AND DATE_FORMAT(a.created_at, '%Y-%m') = :current_month
                           WHERE u.role = 'student'
                           GROUP BY u.id, u.full_name, b.name
                           HAVING attendance_rate < 75 AND total_sessions > 0
                           ORDER BY attendance_rate ASC
                           LIMIT 10";
    $lowAttendanceStmt = $db->prepare($lowAttendanceQuery);
    $lowAttendanceStmt->bindParam(':current_month', $currentMonth);
    $lowAttendanceStmt->execute();
    $stats['lowAttendanceStudents'] = $lowAttendanceStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Daily attendance for the last 7 days
    $dailyQuery = "SELECT DATE(created_at) as date,
                      COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                      COUNT(*) as total_count,
                      ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) / COUNT(*)) * 100, 2) as attendance_rate
                   FROM attendance 
                   WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                   GROUP BY DATE(created_at)
                   ORDER BY date DESC";
    $dailyStmt = $db->prepare($dailyQuery);
    $dailyStmt->execute();
    $stats['dailyAttendance'] = $dailyStmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'stats' => $stats
    ]);
    
} catch (Exception $e) {
    error_log("Attendance overview error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch attendance overview',
        'error' => $e->getMessage()
    ]);
}
?>
