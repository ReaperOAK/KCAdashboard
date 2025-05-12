<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Fix file paths
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/PGN.php';
require_once __DIR__ . '/../../middleware/auth.php';

try {
    // Validate user token and get user data
    $user = getAuthUser();
    if (!$user) {
        http_response_code(403);
        echo json_encode(['message' => 'Unauthorized access']);
        exit();
    }

    // Get pgn_id from URL parameter
    if (!isset($_GET['id'])) {
        throw new Exception('PGN ID is required');
    }
    $pgn_id = $_GET['id'];
    
    $database = new Database();
    $db = $database->getConnection();
    $pgn = new PGN($db);
    
    // Get PGN data
    $pgnData = $pgn->getPGNById($pgn_id, $user['id']);
    
    if (!$pgnData) {
        throw new Exception('PGN not found');
    }
    
    // Check permissions
    if ($pgnData['teacher_id'] != $user['id'] && !$pgnData['has_access'] && !$pgnData['is_public']) {
        if ($user['role'] !== 'student' || !$pgnData['is_public']) {
            throw new Exception('You do not have permission to view this PGN');
        }
    }
    
    // Get share details if user is the owner
    if ($pgnData['teacher_id'] == $user['id']) {
        $pgnData['shares'] = $pgn->getShareUsers($pgn_id);
    }
    
    // Return PGN data
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'pgn' => $pgnData
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage()
    ]);
}
?>
