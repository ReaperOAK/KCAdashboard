<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

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
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch batches: ' . $e->getMessage()
    ]);
}
?>
