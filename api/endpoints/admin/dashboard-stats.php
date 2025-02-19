<?php
define('ROOT_PATH', realpath($_SERVER['DOCUMENT_ROOT'] . '/dashboard/api'));

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Add CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once ROOT_PATH . '/config/database.php';
require_once ROOT_PATH . '/middleware/auth.php';

try {
    error_log("Starting dashboard stats endpoint");
    
    // Verify JWT token
    $user = authenticateToken();
    error_log("User authenticated: " . json_encode($user));

    // Check if user is admin
    if ($user['role'] !== 'admin') {
        throw new Exception('Unauthorized access');
    }

    $db = new Database();
    $conn = $db->getConnection();

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    // Get total students
    $stmt = $conn->query("SELECT COUNT(*) FROM users WHERE role = 'student' AND status = 'active'");
    $totalStudents = (int)$stmt->fetchColumn();

    // Get total teachers
    $stmt = $conn->query("SELECT COUNT(*) FROM users WHERE role = 'teacher' AND status = 'active'");
    $totalTeachers = (int)$stmt->fetchColumn();

    // Get active classes
    $stmt = $conn->query("SELECT COUNT(*) FROM batches WHERE status = 'active'");
    $activeClasses = (int)$stmt->fetchColumn();

    // Get monthly revenue
    $stmt = $conn->query("SELECT COALESCE(SUM(entry_fee), 0) FROM tournament_registrations 
                         WHERE MONTH(registration_date) = MONTH(CURRENT_DATE) 
                         AND YEAR(registration_date) = YEAR(CURRENT_DATE)
                         AND payment_status = 'completed'");
    $monthlyRevenue = (float)$stmt->fetchColumn();

    // Get total batches
    $stmt = $conn->query("SELECT COUNT(*) FROM batches");
    $totalBatches = (int)$stmt->fetchColumn();

    // Get attendance rate
    $sql = "SELECT COALESCE(
            (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 
            0
        ) as attendance_rate
        FROM attendance
        WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)";
    $stmt = $conn->query($sql);
    $attendanceRate = round((float)$stmt->fetchColumn(), 2);

    $response = [
        'status' => 'success',
        'stats' => [
            'totalStudents' => (int)$totalStudents,
            'totalTeachers' => (int)$totalTeachers,
            'activeClasses' => (int)$activeClasses,
            'monthlyRevenue' => (float)$monthlyRevenue,
            'totalBatches' => (int)$totalBatches,
            'attendanceRate' => (float)$attendanceRate
        ]
    ];

    error_log("Sending response: " . json_encode($response));
    echo json_encode($response);

} catch (Exception $e) {
    error_log("Dashboard stats error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'stats' => [
            'totalStudents' => 0,
            'totalTeachers' => 0,
            'activeClasses' => 0,
            'monthlyRevenue' => 0,
            'totalBatches' => 0,
            'attendanceRate' => 0
        ]
    ]);
}
?>
