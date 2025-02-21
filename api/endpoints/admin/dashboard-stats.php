<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get total students
    $studentQuery = "SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'";
    $stmt = $db->query($studentQuery);
    $totalStudents = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Get total teachers
    $teacherQuery = "SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND status = 'active'";
    $stmt = $db->query($teacherQuery);
    $totalTeachers = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Get active classes (batches)
    $classQuery = "SELECT COUNT(*) as count FROM batches WHERE status = 'active'";
    $stmt = $db->query($classQuery);
    $activeClasses = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Get total batches
    $batchQuery = "SELECT COUNT(*) as count FROM batches";
    $stmt = $db->query($batchQuery);
    $totalBatches = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Calculate attendance rate
    $attendanceQuery = "SELECT 
        (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*)) as rate 
        FROM attendance 
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)";
    $stmt = $db->query($attendanceQuery);
    $attendanceRate = round($stmt->fetch(PDO::FETCH_ASSOC)['rate'] ?? 0, 2);

    // Calculate monthly revenue (placeholder - implement actual calculation based on your business logic)
    $monthlyRevenue = 50000; // Example fixed value

    $stats = [
        'totalStudents' => (int)$totalStudents,
        'totalTeachers' => (int)$totalTeachers,
        'activeClasses' => (int)$activeClasses,
        'monthlyRevenue' => (float)$monthlyRevenue,
        'totalBatches' => (int)$totalBatches,
        'attendanceRate' => (float)$attendanceRate
    ];

    echo json_encode(['success' => true, 'stats' => $stats]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to fetch dashboard stats',
        'error' => $e->getMessage()
    ]);
}
?>
