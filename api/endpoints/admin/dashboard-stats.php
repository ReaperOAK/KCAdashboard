<?php
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/cors.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Start with default values
    $stats = [
        'totalStudents' => 0,
        'totalTeachers' => 0,
        'activeClasses' => 0,
        'monthlyRevenue' => 0,
        'totalBatches' => 0,
        'attendanceRate' => 0
    ];

    // Fetch statistics using try-catch for each query
    try {
        $studentQuery = "SELECT COUNT(*) as count FROM users WHERE role = 'student' AND status = 'active'";
        $stmt = $db->query($studentQuery);
        $stats['totalStudents'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    } catch (Exception $e) {
        error_log("Error fetching student count: " . $e->getMessage());
    }

    try {
        $teacherQuery = "SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND status = 'active'";
        $stmt = $db->query($teacherQuery);
        $stats['totalTeachers'] = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    } catch (Exception $e) {
        error_log("Error fetching teacher count: " . $e->getMessage());
    }

    try {
        $batchQuery = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
            FROM batches";
        $stmt = $db->query($batchQuery);
        $batchStats = $stmt->fetch(PDO::FETCH_ASSOC);
        $stats['totalBatches'] = (int)$batchStats['total'];
        $stats['activeClasses'] = (int)$batchStats['active'];
    } catch (Exception $e) {
        error_log("Error fetching batch statistics: " . $e->getMessage());
    }

    try {
        $attendanceQuery = "SELECT 
            IFNULL(
                (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)),
                0
            ) as rate 
            FROM attendance 
            WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)";
        $stmt = $db->query($attendanceQuery);
        $stats['attendanceRate'] = round($stmt->fetch(PDO::FETCH_ASSOC)['rate'] ?? 0, 2);
    } catch (Exception $e) {
        error_log("Error fetching attendance rate: " . $e->getMessage());
    }

    // Set a fixed monthly revenue for now
    $stats['monthlyRevenue'] = 50000;

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'stats' => $stats
    ]);

} catch (Exception $e) {
    error_log("Dashboard Stats Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch dashboard stats',
        'error' => $e->getMessage()
    ]);
}
?>
