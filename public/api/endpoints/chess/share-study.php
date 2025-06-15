<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate data
    if(!isset($data->study_id) || !isset($data->user_ids) || !is_array($data->user_ids)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields (study_id, user_ids)"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize study object
    $study = new ChessStudy($db);
    
    // Check if user is the owner of the study
    $stmt = $study->getById($data->study_id, $user['id']);
    
    if($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Study not found or you don't have access"]);
        exit;
    }
    
    $study_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if($study_data['owner_id'] != $user['id']) {
        http_response_code(403);
        echo json_encode(["message" => "You are not the owner of this study"]);
        exit;
    }
    
    // Share study with each user
    $success_count = 0;
    $failed_count = 0;
    
    foreach($data->user_ids as $user_id) {
        $user_id = intval($user_id);
        if($user_id > 0 && $study->shareWithUser($data->study_id, $user_id)) {
            $success_count++;
        } else {
            $failed_count++;
        }
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Study shared successfully",
        "stats" => [
            "success" => $success_count,
            "failed" => $failed_count
        ]
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to share study",
        "error" => $e->getMessage()
    ]);
}
?>
