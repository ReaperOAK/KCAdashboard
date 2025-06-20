<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        error_log("Get Shareable Users: User not authenticated");
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    error_log("Get Shareable Users: User authenticated, ID: " . $user['id']);
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        error_log("Get Shareable Users: Database connection failed");
        throw new Exception("Database connection failed");
    }
    
    // Get all active users except the current user
    // Only get users who are teachers or students (not admins for security)
    $query = "SELECT id, full_name, email, role 
              FROM users 
              WHERE id != ? 
              AND is_active = 1 
              AND role IN ('teacher', 'student')
              ORDER BY full_name ASC";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $user['id']);
    $stmt->execute();
    
    $users = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $users[] = [
            'id' => $row['id'],
            'name' => $row['full_name'],
            'email' => $row['email'],
            'role' => $row['role']
        ];
    }
    
    error_log("Get Shareable Users: Retrieved " . count($users) . " users");
    
    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "users" => $users
    ]);
    
} catch(Exception $e) {
    error_log("Get Shareable Users Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve users",
        "error" => $e->getMessage()
    ]);
}
?>
