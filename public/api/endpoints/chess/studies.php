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
        error_log("Chess Studies: User not authenticated");
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    error_log("Chess Studies: User authenticated, ID: " . $user['id']);
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        error_log("Chess Studies: Database connection failed");
        throw new Exception("Database connection failed");
    }
    
    error_log("Chess Studies: Database connected successfully");
    
    // Initialize study object
    $study = new ChessStudy($db);
      // Get user's studies
    $studies = $study->getUserStudies($user['id']);
    
    error_log("Chess Studies: Retrieved " . count($studies) . " studies");
    
    http_response_code(200);
    echo json_encode(["success" => true, "studies" => $studies]);
    
} catch(Exception $e) {
    error_log("Chess Studies Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve studies",
        "error" => $e->getMessage()
    ]);
}
?>
