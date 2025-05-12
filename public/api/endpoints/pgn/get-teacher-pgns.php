<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Fix file paths to use correct relative paths
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
    
    // Get shared filter param
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'own';
    
    if ($filter === 'shared') {
        // Get PGNs shared with this teacher
        $pgns = $pgn->getSharedWithMe($user['id']);
    } else {
        // Get teacher's own PGNs
        $pgns = $pgn->getTeacherPGNs($user['id']);
    }
    
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
