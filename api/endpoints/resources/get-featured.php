<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Resource.php';
require_once '../../middleware/auth.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $resource = new Resource($db);

    $featured = $resource->getFeatured();
    
    // Add bookmark status if user is logged in
    $user = verifyToken();
    if ($user) {
        foreach ($featured as &$item) {
            $item['is_bookmarked'] = $resource->isBookmarked($user['id'], $item['id']);
        }
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
