<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT b.*, u.full_name as teacher_name, 
              (SELECT COUNT(*) FROM batch_students WHERE batch_id = b.id AND status = 'active') as current_students 
              FROM batches b 
              LEFT JOIN users u ON b.teacher_id = u.id 
              ORDER BY b.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $batches]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch batches']);
}
?>
