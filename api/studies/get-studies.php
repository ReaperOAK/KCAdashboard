<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';
require_once '../models/Study.php';

try {
    // Authenticate user
    $user = verifyToken();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }
    
    // Get query parameters
    $category = isset($_GET['category']) ? $_GET['category'] : 'all';
    
    $database = new Database();
    $db = $database->getConnection();
    
    $study = new Study($db);
    
    // If we're using local studies
    $studies = $study->getStudies($category, $user['id']);
    
    // If we want to integrate with Lichess API directly
    // According to Lichess API, we can fetch studies using /api/study/by/{username}
    // This could be used to supplement our local studies
    
    echo json_encode(array(
        "success" => true,
        "message" => "Successfully retrieved studies",
        "studies" => $studies
    ));
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => $e->getMessage()
    ));
}
?>
