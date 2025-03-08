<?php
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/cors.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $query = "SELECT id, full_name, email 
              FROM users 
              WHERE role = 'teacher' 
              AND status = 'active' 
              ORDER BY full_name";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Transform data to ensure proper types
    $teachers = array_map(function($teacher) {
        return [
            'id' => (int)$teacher['id'],
            'full_name' => $teacher['full_name'],
            'email' => $teacher['email']
        ];
    }, $teachers);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'teachers' => $teachers
    ]);

} catch (Exception $e) {
    error_log("Get Teachers Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch teachers',
        'error' => $e->getMessage()
    ]);
}
?>
