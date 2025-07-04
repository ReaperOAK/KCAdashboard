<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || empty($input['pgn_id']) || !isset($input['visibility']) || !isset($input['visibility_details'])) {
        throw new Exception('Missing required fields');
    }
    $pgn_id = (int)$input['pgn_id'];
    $visibility = $input['visibility']; // 'public', 'private', 'batch', 'students'
    $visibility_details = $input['visibility_details']; // array or null

    $current_user = getAuthUser();
    if (!$current_user) {
        throw new Exception('Unauthorized');
    }
    $user_id = $current_user['id'];
    $user_role = $current_user['role'];

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Fetch PGN file info
    $stmt = $db->prepare('SELECT * FROM pgn_files WHERE id = ?');
    $stmt->execute([$pgn_id]);
    $pgn = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$pgn) {
        throw new Exception('PGN not found');
    }

    // Permission: admin or owner
    if ($user_role !== 'admin' && $user_id != $pgn['teacher_id']) {
        throw new Exception('Permission denied');
    }

    // Update visibility in metadata
    $metadata = $pgn['metadata'] ? json_decode($pgn['metadata'], true) : [];
    $metadata['visibility'] = $visibility;
    $metadata['visibility_details'] = $visibility_details;
    $stmt = $db->prepare('UPDATE pgn_files SET metadata = ? WHERE id = ?');
    $stmt->execute([json_encode($metadata), $pgn_id]);

    echo json_encode(['success' => true, 'message' => 'Visibility updated']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
