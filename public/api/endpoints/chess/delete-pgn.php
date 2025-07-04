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
    if (!$input || empty($input['pgn_id'])) {
        throw new Exception('Missing PGN ID');
    }
    $pgn_id = (int)$input['pgn_id'];

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
    $stmt = $db->prepare('SELECT teacher_id, file_path FROM pgn_files WHERE id = ?');
    $stmt->execute([$pgn_id]);
    $pgn = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$pgn) {
        throw new Exception('PGN not found');
    }

    // Permission: admin or owner
    if ($user_role !== 'admin' && $user_id != $pgn['teacher_id']) {
        throw new Exception('Permission denied');
    }

    // Delete DB record
    $stmt = $db->prepare('DELETE FROM pgn_files WHERE id = ?');
    $stmt->execute([$pgn_id]);

    // Delete file
    $file_path = __DIR__ . '/../../' . $pgn['file_path'];
    if (file_exists($file_path)) {
        unlink($file_path);
    }

    // Remove shares
    $stmt = $db->prepare('DELETE FROM pgn_shares WHERE pgn_id = ?');
    $stmt->execute([$pgn_id]);

    echo json_encode(['success' => true, 'message' => 'PGN deleted']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
