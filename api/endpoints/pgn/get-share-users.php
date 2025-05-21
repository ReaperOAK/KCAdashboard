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
    if (!$user || $user['role'] !== 'teacher') {
        http_response_code(403);
        echo json_encode(['message' => 'Unauthorized access']);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $pgn = new PGN($db);
    
    // Get pgn_id from URL parameter
    if (!isset($_GET['pgn_id'])) {
        throw new Exception('PGN ID is required');
    }
    $pgn_id = $_GET['pgn_id'];
    
    // Verify that user owns this PGN
    $pgnData = $pgn->getPGNById($pgn_id, $user['id']);
    if (!$pgnData || $pgnData['teacher_id'] != $user['id']) {
        throw new Exception('You do not have permission to view this PGN\'s shares');
    }
    
    // Get users with whom the PGN is shared
    $shares = $pgn->getShareUsers($pgn_id);
    
    // Return shares
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'shares' => $shares
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage()
    ]);
}
?>
