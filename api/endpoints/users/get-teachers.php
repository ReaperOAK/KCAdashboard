<?php
define('ROOT_PATH', realpath($_SERVER['DOCUMENT_ROOT'] . '/dashboard/api'));

require_once ROOT_PATH . '/config/database.php';
require_once '../../middleware/auth.php';

// Verify JWT token
$user = authenticateToken();

try {
    $db = new Database();
    $conn = $db->getConnection();

    $sql = "SELECT id, full_name, email, status 
            FROM users 
            WHERE role = 'teacher' AND status = 'active'
            ORDER BY full_name ASC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'teachers' => $teachers
    ]);

} catch (Exception $e) {
    error_log("Error in get-teachers.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch teachers: ' . $e->getMessage()
    ]);
}
?>
