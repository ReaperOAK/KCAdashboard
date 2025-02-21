<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/Database.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Batch ID is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT b.*, u.full_name as teacher_name, u.email as teacher_email,
              (SELECT COUNT(*) FROM batch_students WHERE batch_id = b.id AND status = 'active') as current_students
              FROM batches b 
              LEFT JOIN users u ON b.teacher_id = u.id 
              WHERE b.id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->execute(['id' => $id]);
    $batch = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($batch) {
        echo json_encode(['success' => true, 'data' => $batch]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Batch not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch batch details']);
}
?>
