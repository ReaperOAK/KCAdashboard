<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

define('ROOT_PATH', realpath($_SERVER['DOCUMENT_ROOT'] . '/dashboard/api'));

require_once ROOT_PATH . '/config/cors.php';
require_once ROOT_PATH . '/config/database.php';
require_once ROOT_PATH . '/middleware/auth.php';

// Add debugging
error_log("Root path: " . ROOT_PATH);
error_log("Current file: " . __FILE__);

// Verify JWT token
$user = authenticateToken();

try {
    $db = new Database();
    $conn = $db->getConnection();

    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $sql = "SELECT 
        b.*, 
        u.full_name as teacher_name,
        (SELECT COUNT(*) FROM batch_students WHERE batch_id = b.id) as current_students
    FROM batches b
    LEFT JOIN users u ON b.teacher_id = u.id
    ORDER BY b.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'batches' => $batches
    ]);

} catch (Exception $e) {
    error_log("Error in get-all.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch batches: ' . $e->getMessage()
    ]);
}
?>
