<?php
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/cors.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $query = "SELECT 
                b.*, 
                u.full_name as teacher_name,
                (SELECT COUNT(*) FROM batch_students 
                 WHERE batch_id = b.id AND status = 'active') as current_students
              FROM batches b
              LEFT JOIN users u ON b.teacher_id = u.id
              ORDER BY b.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Transform data to ensure proper types
    $batches = array_map(function($batch) {
        return [
            'id' => (int)$batch['id'],
            'name' => $batch['name'],
            'description' => $batch['description'],
            'level' => $batch['level'],
            'schedule' => $batch['schedule'],
            'max_students' => (int)$batch['max_students'],
            'teacher_id' => (int)$batch['teacher_id'],
            'teacher_name' => $batch['teacher_name'],
            'current_students' => (int)$batch['current_students'],
            'status' => $batch['status'],
            'created_at' => $batch['created_at']
        ];
    }, $batches);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'batches' => $batches
    ]);

} catch (Exception $e) {
    error_log("Get Batches Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch batches',
        'error' => $e->getMessage()
    ]);
}
?>
