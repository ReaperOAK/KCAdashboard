<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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
        error_log("Shared Studies: User not authenticated");
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    error_log("Shared Studies: User authenticated, ID: " . $user['id']);
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        error_log("Shared Studies: Database connection failed");
        throw new Exception("Database connection failed");
    }
    
    // Initialize study object
    $study = new ChessStudy($db);
      // Get studies shared with user
    $studies = $study->getSharedStudies($user['id']);
    
    error_log("Shared Studies: Retrieved " . count($studies) . " shared studies");
    
    http_response_code(200);
    echo json_encode(["success" => true, "studies" => $studies]);
    
} catch(Exception $e) {
    error_log("Shared Studies Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve shared studies",
        "error" => $e->getMessage()
    ]);
}
?>
