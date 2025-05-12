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
    
    // Initialize practice object
    $practice = new ChessPractice($db);
    
    // Get practice positions
    $stmt = $practice->getPositions($type);
    $positions = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $position_item = [
            "id" => $row['id'],
            "title" => $row['title'],
            "description" => $row['description'],
            "position" => $row['position'],
            "type" => $row['type'],
            "difficulty" => $row['difficulty'],
            "engine_level" => $row['engine_level'],
            "creator_name" => $row['creator_name'],
            "preview_url" => $row['preview_url'],
            "created_at" => $row['created_at']
        ];
        
        $positions[] = $position_item;
    }
    
    http_response_code(200);
    echo json_encode(["success" => true, "positions" => $positions]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve practice positions",
        "error" => $e->getMessage()
    ]);
}
?>
