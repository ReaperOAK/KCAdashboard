<?php
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
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Initialize study object
    $study = new ChessStudy($db);
    
    // Get user's studies
    $stmt = $study->getUserStudies($user['id']);
    $studies = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $study_item = [
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
        
        $studies[] = $study_item;
    }
    
    http_response_code(200);
    echo json_encode(["success" => true, "studies" => $studies]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve studies",
        "error" => $e->getMessage()
    ]);
}
?>
