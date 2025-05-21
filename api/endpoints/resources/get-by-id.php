<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Resource.php';
require_once '../../middleware/auth.php';

try {
    // Validate user token
    $user = verifyToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $resource = new Resource($db);

    // Get resource ID from request
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if($id > 0) {
        // Get resource details
        $resourceData = $resource->getResourceById($id);
        
        if(!$resourceData) {
            http_response_code(404);
            echo json_encode([
                "message" => "Resource not found"
            ]);
            exit();
        }
        
        // Add bookmark status
        $resourceData['is_bookmarked'] = $resource->isBookmarked($user['id'], $id);
        
        http_response_code(200);
        echo json_encode([
            "resource" => $resourceData
        ]);
    } else {
        throw new Exception("Resource ID is required");
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching resource details",
        "error" => $e->getMessage()
    ]);
}
?>
