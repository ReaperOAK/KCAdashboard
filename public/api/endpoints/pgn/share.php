<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/PGN.php';
require_once __DIR__ . '/../../models/User.php';
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
    
    // Get request data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (empty($data['pgn_id']) || empty($data['user_ids'])) {
        throw new Exception('PGN ID and User IDs are required');
    }
    
    // Verify that user owns this PGN
    $pgnData = $pgn->getPGNById($data['pgn_id'], $user['id']);
    if (!$pgnData || $pgnData['teacher_id'] != $user['id']) {
        throw new Exception('You do not have permission to share this PGN');
    }
    
    // Share the PGN with specified users
    $permission = isset($data['permission']) ? $data['permission'] : 'view';
    $result = $pgn->sharePGN($data['pgn_id'], $data['user_ids'], $permission);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'PGN shared successfully'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage()
    ]);
}
?>
