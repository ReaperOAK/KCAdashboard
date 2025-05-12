<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Resource.php';
require_once '../../middleware/auth.php';

try {
    // Get user from token
    $user = verifyToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $resource = new Resource($db);

    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->resource_id)) {
        if($resource->logAccess($user['id'], $data->resource_id)) {
            http_response_code(200);
            echo json_encode(["message" => "Access logged successfully"]);
        } else {
            throw new Exception("Failed to log access");
        }
    } else {
        throw new Exception("Resource ID is required");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error logging resource access",
        "error" => $e->getMessage()
    ]);
}
?>
