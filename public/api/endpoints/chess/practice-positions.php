<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessPractice.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get type filter from URL parameter
    $type = isset($_GET['type']) ? $_GET['type'] : 'all';
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    // Initialize practice object
    $practice = new ChessPractice($db);
    
    // Get practice positions
    $positions = $practice->getPositionsByType($type);
    
    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "positions" => $positions,
        "count" => count($positions),
        "type_filter" => $type
    ]);
    
} catch(Exception $e) {
    error_log("Practice positions error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve practice positions",
        "error" => $e->getMessage(),
        "file" => basename(__FILE__),
        "line" => $e->getLine()
    ]);
}
?>
