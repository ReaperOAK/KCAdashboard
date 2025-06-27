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
        error_log("Study Details: User not authenticated");
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get study ID from URL parameter
    $study_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if(!$study_id) {
        error_log("Study Details: Missing study ID");
        http_response_code(400);
        echo json_encode(["message" => "Missing study ID parameter"]);
        exit;
    }
    
    error_log("Study Details: Getting study ID: " . $study_id . " for user: " . $user['id']);
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        error_log("Study Details: Database connection failed");
        throw new Exception("Database connection failed");
    }
    
    // Initialize study object
    $study = new ChessStudy($db);
    
    // Get study details
    $stmt = $study->getById($study_id, $user['id']);
    
    if($stmt->rowCount() == 0) {
        error_log("Study Details: Study not found or no access for study ID: " . $study_id);
        http_response_code(404);
        echo json_encode(["message" => "Study not found or you don't have access"]);
        exit;
    }
    
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    error_log("Study Details: Successfully retrieved study: " . $row['title']);
    
    $study_data = [
        "id" => $row['id'],
        "title" => $row['title'],
        "description" => $row['description'],
        "category" => $row['category'],
        "position" => $row['position'],
        "is_public" => $row['is_public'] ? true : false,
        "preview_url" => $row['preview_url'],
        "owner" => [
            "id" => $row['owner_id'],
            "name" => $row['owner_name']
        ],
        "created_at" => $row['created_at'],
        "updated_at" => $row['updated_at']
    ];
    
    http_response_code(200);
    echo json_encode(["success" => true, "study" => $study_data]);
    
} catch(Exception $e) {
    error_log("Study Details Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve study details",
        "error" => $e->getMessage()
    ]);
}
?>
