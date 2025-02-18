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

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

try {
    $db = new Database();
    $conn = $db->getConnection();

    $sql = "INSERT INTO batches (name, description, level, schedule, max_students, teacher_id, status) 
            VALUES (:name, :description, :level, :schedule, :max_students, :teacher_id, :status)";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':name' => $data['name'],
        ':description' => $data['description'],
        ':level' => $data['level'],
        ':schedule' => $data['schedule'],
        ':max_students' => $data['max_students'],
        ':teacher_id' => $data['teacher_id'],
        ':status' => $data['status']
    ]);

    $batchId = $conn->lastInsertId();

    echo json_encode([
        'status' => 'success',
        'message' => 'Batch created successfully',
        'batch_id' => $batchId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to create batch: ' . $e->getMessage()
    ]);
}
?>
