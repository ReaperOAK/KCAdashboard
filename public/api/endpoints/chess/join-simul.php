<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
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
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->simul_id)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required field (simul_id)"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize simul object
    $simul = new ChessSimul($db);
    
    // Join the simul
    if($simul->addPlayer($data->simul_id, $user['id'])) {
        // Get updated simul details
        $stmt = $simul->getById($data->simul_id);
        $simul_data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get boards
        $boards_stmt = $simul->getBoards($data->simul_id);
        $boards = [];
        
        while ($board = $boards_stmt->fetch(PDO::FETCH_ASSOC)) {
            $boards[] = [
                "id" => $board['id'],
                "player_id" => $board['player_id'],
                "player_name" => $board['player_name'],
                "position" => $board['position'],
                "status" => $board['status'],
                "result" => $board['result'],
                "turn" => $board['turn']
            ];
        }
        
        $response = [
            "success" => true,
            "message" => "Successfully joined the simul",
            "simul" => [
                "id" => $simul_data['id'],
                "title" => $simul_data['title'] ?: "Simul by {$simul_data['host_name']}",
                "host" => [
                    "id" => $simul_data['host_id'],
                    "name" => $simul_data['host_name']
                ],
                "status" => $simul_data['status'],
                "max_players" => $simul_data['max_players'],
                "time_control" => $simul_data['time_control'],
                "boards" => $boards
            ]
        ];
        
        http_response_code(200);
        echo json_encode($response);
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Failed to join simul. The simul may be full or you're already participating."
        ]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to join simul",
        "error" => $e->getMessage()
    ]);
}
?>
