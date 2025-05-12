<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../utils/Stockfish.php'; // Utility class for Stockfish integration

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
    if(!isset($data->fen)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required field (fen)"]);
        exit;
    }
    
    // Get depth parameter with default
    $depth = isset($data->depth) ? intval($data->depth) : 15;
    
    // Ensure depth is within reasonable limits
    $depth = min(max($depth, 5), 20);
    
    // Create stockfish instance
    $stockfish = new Stockfish();
    
    // Get analysis
    $analysis = $stockfish->analyze($data->fen, $depth);
    
    if($analysis) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "analysis" => $analysis
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to analyze position"
        ]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to perform engine analysis",
        "error" => $e->getMessage()
    ]);
}
?>
