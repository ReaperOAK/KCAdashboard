<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

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
        error_log("Create Study: User not authenticated");
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    error_log("Create Study: User authenticated, ID: " . $user['id']);
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        error_log("Create Study: Database connection failed");
        throw new Exception("Database connection failed");
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    error_log("Create Study: Received data: " . json_encode($data));
    
    // Validate data
    if(!isset($data->title) || !isset($data->category)) {
        error_log("Create Study: Missing required fields");
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields (title, category)"]);
        exit;
    }
    
    // Initialize study object
    $study = new ChessStudy($db);
    
    // Set study properties
    $study->title = $data->title;
    $study->description = $data->description ?? '';
    $study->position = $data->position ?? 'start';
    $study->category = $data->category;
    $study->owner_id = $user['id'];
    $study->is_public = $data->isPublic ?? false;
    
    // Create the study
    if($study->create()) {
        // Get the newly created study details
        $study_id = $db->lastInsertId();
        $stmt = $study->getById($study_id, $user['id']);
        $study_data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response = [
            "success" => true,
            "message" => "Study created successfully",
            "study" => [
                "id" => $study_data['id'],
                "title" => $study_data['title'],
                "description" => $study_data['description'],
                "category" => $study_data['category'],
                "position" => $study_data['position'],
                "is_public" => $study_data['is_public'] ? true : false,
                "owner" => [
                    "id" => $study_data['owner_id'],
                    "name" => $study_data['owner_name']
                ],
                "created_at" => $study_data['created_at']
            ]
        ];
        
        http_response_code(201);
        echo json_encode($response);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Unable to create study"]);
    }
    
} catch(Exception $e) {
    error_log("Chess Create Study Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to create study",
        "error" => $e->getMessage()
    ]);
}
?>
