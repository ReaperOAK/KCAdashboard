<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

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
        error_log("Share Study: User not authenticated");
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    error_log("Share Study: User authenticated, ID: " . $user['id']);
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    error_log("Share Study: Received data: " . json_encode($data));
    
    // Validate data
    if(!isset($data->study_id) || !isset($data->user_ids) || !is_array($data->user_ids)) {
        error_log("Share Study: Missing required fields");
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields (study_id, user_ids)"]);
        exit;
    }
      // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        error_log("Share Study: Database connection failed");
        throw new Exception("Database connection failed");
    }
    
    // Initialize study object
    $study = new ChessStudy($db);
    
    // Check if user is the owner of the study
    $stmt = $study->getById($data->study_id, $user['id']);
    
    if($stmt->rowCount() == 0) {
        error_log("Share Study: Study not found or no access for study ID: " . $data->study_id);
        http_response_code(404);
        echo json_encode(["message" => "Study not found or you don't have access"]);
        exit;
    }
    
    $study_data = $stmt->fetch(PDO::FETCH_ASSOC);
    error_log("Share Study: Retrieved study: " . $study_data['title'] . " owned by: " . $study_data['owner_id']);
      if($study_data['owner_id'] != $user['id']) {
        error_log("Share Study: User is not owner of study");
        http_response_code(403);
        echo json_encode(["message" => "You are not the owner of this study"]);
        exit;
    }
    
    error_log("Share Study: User is owner, proceeding to share with " . count($data->user_ids) . " users");
    
    // Set the study ID and share with users
    $study->id = $data->study_id;
    $result = $study->shareStudy($data->user_ids);
    
    error_log("Share Study: Shared successfully with " . $result['successful'] . " users");
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Study shared successfully",
        "stats" => [
            "success" => $result['successful'],
            "failed" => count($result['errors']),
            "errors" => $result['errors']
        ]
    ]);
    
} catch(Exception $e) {
    error_log("Share Study Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to share study",
        "error" => $e->getMessage()
    ]);
}
?>
