<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessSimul.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize simul object
    $simul = new ChessSimul($db);
    
    // Get active simuls
    $stmt = $simul->getActiveSimuls();
    $simuls = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $simul_item = [
            "id" => $row['id'],
            "title" => $row['title'] ?: "Simul by {$row['host_name']}",
            "host" => [
                "id" => $row['host_id'],
                "name" => $row['host_name']
            ],
            "status" => $row['status'],
            "description" => $row['description'],
            "max_players" => $row['max_players'],
            "player_count" => $row['player_count'] ?? 0,
            "time_control" => $row['time_control'],
            "created_at" => $row['created_at']
        ];
        
        $simuls[] = $simul_item;
    }
    
    http_response_code(200);
    echo json_encode(["success" => true, "simuls" => $simuls]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve simul games",
        "error" => $e->getMessage()
    ]);
}
?>
