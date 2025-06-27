<?php
// Required headers
require_once '../../config/cors.php';

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessStudy.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get study ID from URL parameter
    $study_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if(!$study_id) {
        http_response_code(400);
        echo json_encode(["message" => "Missing study ID parameter"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->position)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required field (position)"]);
        exit;
    }
    
    // Initialize study object
    $study = new ChessStudy($db);
    
    // Set study properties
    $study->id = $study_id;
    $study->title = $data->title ?? null;
    $study->description = $data->description ?? null;
    $study->position = $data->position;
    $study->category = $data->category ?? null;
    $study->owner_id = $user['id'];
    $study->is_public = $data->is_public ?? null;
    
    // Update the study
    if($study->update()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Study updated successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Unable to update study"
        ]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to update study",
        "error" => $e->getMessage()
    ]);
}
?>
