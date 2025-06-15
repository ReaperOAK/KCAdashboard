<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, full_name, email 
              FROM users 
              WHERE role = 'teacher' AND status = 'active' 
              ORDER BY full_name";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $teachers]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch teachers']);
}
?>
