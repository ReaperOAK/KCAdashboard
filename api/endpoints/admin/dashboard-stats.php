<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    // Verify JWT token
    $user = authenticateToken();

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

    // Return the response with explicit headers
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'stats' => [
            'totalStudents' => $totalStudents,
            'totalTeachers' => $totalTeachers,
            'activeClasses' => $activeClasses,
            'monthlyRevenue' => $monthlyRevenue,
            'totalBatches' => $totalBatches,
            'attendanceRate' => $attendanceRate
        ]
    ]);

} catch (Exception $e) {
    error_log("Dashboard stats error: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
