<?php
require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Verify JWT token
$user = authenticateToken();

// Check if user is admin
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$batchId = isset($_GET['id']) ? $_GET['id'] : null;

if (!$batchId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Batch ID is required']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    $sql = "UPDATE batches 
            SET name = :name,
                description = :description,
                level = :level,
                schedule = :schedule,
                max_students = :max_students,
                teacher_id = :teacher_id,
                status = :status
            WHERE id = :id";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':id' => $batchId,
        ':name' => $data['name'],
        ':description' => $data['description'],
        ':level' => $data['level'],
        ':schedule' => $data['schedule'],
        ':max_students' => $data['max_students'],
        ':teacher_id' => $data['teacher_id'],
        ':status' => $data['status']
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Batch updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update batch: ' . $e->getMessage()
    ]);
}
?>
