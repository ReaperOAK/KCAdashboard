<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/Database.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Batch ID is required']);
        exit;
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();

        // First check if there are any active students
        $checkQuery = "SELECT COUNT(*) as count FROM batch_students 
                      WHERE batch_id = :id AND status = 'active'";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute(['id' => $id]);
        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($result['count'] > 0) {
            throw new Exception('Cannot delete batch with active students');
        }

        // If no active students, proceed with deletion
        $query = "DELETE FROM batches WHERE id = :id";
        $stmt = $db->prepare($query);
        $result = $stmt->execute(['id' => $id]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Batch deleted successfully']);
        } else {
            throw new Exception('Failed to delete batch');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
