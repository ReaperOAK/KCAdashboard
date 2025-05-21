<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessPractice.php';
require_once '../../middleware/auth.php';
require_once '../../utils/ChessHelper.php'; // A utility class for generating thumbnails

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
    if(!isset($data->title) || !isset($data->position) || !isset($data->type) || !isset($data->difficulty)) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing required fields (title, position, type, difficulty)"
        ]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize practice object
    $practice = new ChessPractice($db);
    
    // Set practice properties
    $practice->title = $data->title;
    $practice->description = $data->description ?? '';
    $practice->position = $data->position;
    $practice->type = $data->type;
    $practice->difficulty = $data->difficulty;
    $practice->engine_level = $data->engine_level ?? 5;
    $practice->created_by = $user['id'];
    
    // Generate a thumbnail/preview image if possible
    $thumbnailPath = null;
    if (class_exists('ChessHelper')) {
        $thumbnailPath = ChessHelper::generatePositionThumbnail($data->position);
        if ($thumbnailPath) {
            $practice->preview_url = $thumbnailPath;
        }
    }
    
    // Create the practice position
    if($practice->create()) {
        $response = [
            "success" => true,
            "message" => "Practice position created successfully",
            "position" => [
                "id" => $practice->id,
                "title" => $practice->title,
                "description" => $practice->description,
                "position" => $practice->position,
                "type" => $practice->type,
                "difficulty" => $practice->difficulty,
                "engine_level" => $practice->engine_level,
                "preview_url" => $practice->preview_url,
                "created_at" => date('Y-m-d H:i:s')
            ]
        ];
        
        http_response_code(201);
        echo json_encode($response);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Unable to create practice position"]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to create practice position",
        "error" => $e->getMessage()
    ]);
}
?>
