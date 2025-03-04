<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../config/Database.php';
require_once '../models/PGN.php';
require_once '../middleware/auth.php';

try {
    // Validate user token and get user data
    $user = getAuthUser();
    if (!$user) {
        http_response_code(403);
        echo json_encode(['message' => 'Unauthorized access']);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $pgn = new PGN($db);
    
    // Get filter options
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $teacher_id = isset($_GET['teacher_id']) ? $_GET['teacher_id'] : null;
    
    // Get public PGNs
    $pgns = $pgn->getPublicPGNs($category, $teacher_id);
    
    // Return PGNs
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'pgns' => $pgns
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage()
    ]);
}
?>
