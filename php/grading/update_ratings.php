<?php
require_once('../config.php');
header('Content-Type: application/json');

// Ensure request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Begin transaction
    $conn->begin_transaction();
    
    // Prepare statement for performance update
    $stmt = $conn->prepare("INSERT INTO performance (student_id, rating, comments, updated_by) VALUES (?, ?, ?, ?)");
    
    foreach ($data['updates'] as $update) {
        $stmt->bind_param("iisi", 
            $update['student_id'], 
            $update['rating'], 
            $update['comments'], 
            $data['teacher_id']
        );
        $stmt->execute();
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode(['success' => true, 'message' => 'Ratings updated successfully']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>
