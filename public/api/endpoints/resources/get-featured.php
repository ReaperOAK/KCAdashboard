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

    // Get featured resources based on user role and access permissions
    if ($user['role'] === 'admin' || $user['role'] === 'teacher') {
        // Admin and teachers can see all featured resources
        $featured = $resource->getFeatured();
    } else {
        // Students can only see public featured resources and those shared with them
        $featured = $resource->getStudentAccessibleFeatured($user['id']);
    }
    
    // Add bookmark status
    foreach ($featured as &$item) {
        $item['is_bookmarked'] = $resource->isBookmarked($user['id'], $item['id']);
    }
    
    http_response_code(200);
    echo json_encode([
        "resources" => $featured
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching featured resources",
        "error" => $e->getMessage()
    ]);
}
?>
