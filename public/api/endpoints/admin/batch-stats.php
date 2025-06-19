<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate authentication
    $user_id = validateToken();
    
    // Get user role
    $database = new Database();
    $db = $database->getConnection();
    
    $userQuery = "SELECT role FROM users WHERE id = :user_id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':user_id', $user_id);
    $userStmt->execute();
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userData || $userData['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }
    
    // Get batch statistics
    $stats = [];
    
    // Total batches by status
    $statusQuery = "SELECT status, COUNT(*) as count FROM batches GROUP BY status";
    $statusStmt = $db->prepare($statusQuery);
    $statusStmt->execute();
    $statusData = $statusStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stats['batchesByStatus'] = [];
    foreach ($statusData as $row) {
        $stats['batchesByStatus'][$row['status']] = (int)$row['count'];
    }
    
    // Batches by level
    $levelQuery = "SELECT level, COUNT(*) as count FROM batches GROUP BY level";
    $levelStmt = $db->prepare($levelQuery);
    $levelStmt->execute();
    $levelData = $levelStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stats['batchesByLevel'] = [];
    foreach ($levelData as $row) {
        $stats['batchesByLevel'][$row['level']] = (int)$row['count'];
    }
    
    // Average students per batch
    $avgQuery = "SELECT AVG(student_count) as avg_students 
                 FROM (SELECT batch_id, COUNT(*) as student_count 
                       FROM batch_students 
                       WHERE status = 'active' 
                       GROUP BY batch_id) as batch_counts";
    $avgStmt = $db->prepare($avgQuery);
    $avgStmt->execute();
    $avgData = $avgStmt->fetch(PDO::FETCH_ASSOC);
    $stats['averageStudentsPerBatch'] = round($avgData['avg_students'] ?? 0, 1);
    
    // Batches with most students
    $topBatchesQuery = "SELECT b.name, b.id, COUNT(bs.student_id) as student_count
                        FROM batches b
                        LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'active'
                        WHERE b.status = 'active'
                        GROUP BY b.id, b.name
                        ORDER BY student_count DESC
                        LIMIT 5";
    $topBatchesStmt = $db->prepare($topBatchesQuery);
    $topBatchesStmt->execute();
    $stats['topBatches'] = $topBatchesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'stats' => $stats
    ]);
    
} catch (Exception $e) {
    error_log("Batch stats error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch batch statistics',
        'error' => $e->getMessage()
    ]);
}
?>
