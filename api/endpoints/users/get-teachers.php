<?php
require_once '../../config/database.php';
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
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch teachers: ' . $e->getMessage()
    ]);
}
?>
