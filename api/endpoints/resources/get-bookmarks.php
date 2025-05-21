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

    // Get bookmarks for current user
    $bookmarks = $resource->getUserBookmarks($user['id']);
    
    // Add bookmark status (always true for bookmarks endpoint)
    foreach ($bookmarks as &$item) {
        $item['is_bookmarked'] = true;
    }
    
    http_response_code(200);
    echo json_encode([
        "resources" => $bookmarks,
        "count" => count($bookmarks)
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching bookmarks",
        "error" => $e->getMessage()
    ]);
}
?>
