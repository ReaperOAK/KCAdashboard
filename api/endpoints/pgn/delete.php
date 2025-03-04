<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE, POST');
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
    
    // Get pgn_id from URL parameter or POST data
    $pgn_id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$pgn_id) {
        // Check if it's in the request body
        $data = json_decode(file_get_contents('php://input'), true);
        $pgn_id = isset($data['id']) ? $data['id'] : null;
    }
    
    if (!$pgn_id) {
        throw new Exception('PGN ID is required');
    }
    
    // Verify that user owns this PGN
    $pgnData = $pgn->getPGNById($pgn_id, $user['id']);
    if (!$pgnData) {
        throw new Exception('PGN not found');
    }
    
    if ($pgnData['teacher_id'] != $user['id']) {
        throw new Exception('You do not have permission to delete this PGN');
    }
    
    // Delete the PGN
    $result = $pgn->delete($pgn_id);
    
    // Delete the physical file if it exists
    if ($pgnData['file_path'] && file_exists(__DIR__ . '/../../' . $pgnData['file_path'])) {
        unlink(__DIR__ . '/../../' . $pgnData['file_path']);
    }
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'PGN deleted successfully'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage()
    ]);
}
?>
