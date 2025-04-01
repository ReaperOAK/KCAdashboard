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
    $resource_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if($resource_id > 0) {
        // Get resource details
        $resource_data = $resource->getResourceById($resource_id);
        
        if(!$resource_data) {
            throw new Exception("Resource not found");
        }
        
        // Increment download counter
        $resource->incrementDownloads($resource_id);
        
        // Log access
        $resource->logAccess($user['id'], $resource_id);
        
        // Get file path
        $file_path = $_SERVER['DOCUMENT_ROOT'] . $resource_data['url'];
        
        if(!file_exists($file_path)) {
            throw new Exception("File not found on server");
        }
        
        // Set appropriate headers for file download
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="'.basename($file_path).'"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file_path));
        flush();
        readfile($file_path);
        exit;
    } else {
        throw new Exception("Resource ID is required");
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error downloading resource",
        "error" => $e->getMessage()
    ]);
}
?>
