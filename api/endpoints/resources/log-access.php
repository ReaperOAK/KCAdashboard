<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Resource.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $resource = new Resource($db);

    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->resource_id)) {
        // Get user_id from token (implement proper token validation)
        $headers = getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        $user_id = 1; // Temporary! Replace with actual user_id from token

        if($resource->logAccess($user_id, $data->resource_id)) {
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
