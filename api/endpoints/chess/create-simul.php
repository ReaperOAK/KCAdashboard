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
    
    // Verify user is a teacher or admin
    if(!in_array($user['role'], ['teacher', 'admin'])) {
        http_response_code(403);
        echo json_encode(["message" => "Only teachers and admins can create simultaneous exhibitions"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->maxPlayers) || !isset($data->timeControl)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields (maxPlayers, timeControl)"]);
        exit;
    }
    
    // Initialize simul object
    $simul = new ChessSimul($db);
    
    // Set simul properties
    $simul->title = $data->title ?? null;
    $simul->host_id = $user['id'];
    $simul->description = $data->description ?? '';
    $simul->max_players = min(20, max(1, intval($data->maxPlayers))); // Limit between 1-20
    $simul->time_control = $data->timeControl;
    
    // Create the simul
    if($simul->create()) {
        $response = [
            "success" => true,
            "message" => "Simultaneous exhibition created successfully",
            "simul" => [
                "id" => $simul->id,
                "title" => $simul->title,
                "host" => [
                    "id" => $user['id'],
                    "name" => $user['full_name']
                ],
                "description" => $simul->description,
                "max_players" => $simul->max_players,
                "player_count" => 0,
                "time_control" => $simul->time_control,
                "status" => "pending"
            ]
        ];
        
        http_response_code(201);
        echo json_encode($response);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Unable to create simul"]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to create simul",
        "error" => $e->getMessage()
    ]);
}
?>
