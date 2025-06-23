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

    // Get search term and filters
    $search_term = isset($_GET['q']) ? $_GET['q'] : '';
    
    $filters = [];
    if (isset($_GET['category'])) {
        $filters['category'] = $_GET['category'];
    }
    
    if (isset($_GET['type'])) {
        $filters['type'] = $_GET['type'];
    }
    
    if (isset($_GET['difficulty'])) {
        $filters['difficulty'] = $_GET['difficulty'];
    }
    
    // Get results based on user role and access permissions
    if ($user['role'] === 'admin' || $user['role'] === 'teacher') {
        // Admin and teachers can search all resources
        $results = $resource->search($search_term, $filters);
    } else {
        // Students can only search public resources and those shared with them
        $results = $resource->searchStudentAccessibleResources($user['id'], $search_term, $filters);
    }
    
    // Add bookmark status to results
    foreach ($results as &$item) {
        $item['is_bookmarked'] = $resource->isBookmarked($user['id'], $item['id']);
    }
    
    http_response_code(200);
    echo json_encode([
        "resources" => $results,
        "count" => count($results),
        "filters" => $filters
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error searching resources",
        "error" => $e->getMessage()
    ]);
}
?>
