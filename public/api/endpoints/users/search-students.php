<?php
require_once '../../config/cors.php';

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    // Include required files
    require_once '../../config/Database.php';
    require_once '../../utils/authorize.php';

    // Verify teacher or admin authorization
    try {
        $user = authorize(['teacher', 'admin']);
    } catch (Exception $authEx) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication failed: ' . $authEx->getMessage()]);
        exit;
    }
    
    // Get search query
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';
    
    if(strlen($search) < 2) {
        echo json_encode(['success' => true, 'students' => []]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Search for students
    $query = "SELECT id, full_name, email 
              FROM users 
              WHERE role = 'student' 
              AND (full_name LIKE :search OR email LIKE :search)
              AND is_active = 1
              LIMIT 20";
              
    $stmt = $db->prepare($query);
    $searchParam = "%{$search}%";
    $stmt->bindParam(':search', $searchParam);
    $stmt->execute();
    
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'students' => $students]);
    
} catch(Exception $e) {
    // Log error to server log
    error_log("Search Students Error: " . $e->getMessage());
    
    // Return proper error response
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
