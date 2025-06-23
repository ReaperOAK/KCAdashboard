<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Resource.php';
require_once '../../middleware/auth.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $resource = new Resource($db);

    // Validate user token
    $user = verifyToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit();
    }

    $category = isset($_GET['category']) ? $_GET['category'] : die();
    
    // Get resources based on user role and access permissions
    if ($user['role'] === 'admin' || $user['role'] === 'teacher') {
        // Admin and teachers can see all resources
        $resources = $resource->getByCategory($category);
    } else {
        // Students can only see public resources and those shared with them
        $resources = $resource->getStudentAccessibleResourcesByCategory($user['id'], $category);
    }

    // Add bookmark status
    foreach ($resources as &$item) {
        $item['is_bookmarked'] = $resource->isBookmarked($user['id'], $item['id']);
    }

    http_response_code(200);
    echo json_encode([
        "resources" => $resources
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching resources by category",
        "error" => $e->getMessage()
    ]);
}
?>
