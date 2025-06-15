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
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->resource_id)) {
        // Remove bookmark
        if($resource->unbookmark($user['id'], $data->resource_id)) {
            http_response_code(200);
            echo json_encode([
                "message" => "Resource removed from bookmarks",
                "resource_id" => $data->resource_id,
                "is_bookmarked" => false
            ]);
        } else {
            throw new Exception("Failed to unbookmark resource");
        }
    } else {
        throw new Exception("Resource ID is required");
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error removing bookmark",
        "error" => $e->getMessage()
    ]);
}
?>
