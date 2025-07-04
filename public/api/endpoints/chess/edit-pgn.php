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

    // Update fields
    $fields = [];
    $params = [];
    if (isset($input['title'])) {
        $fields[] = 'title = ?';
        $params[] = trim($input['title']);
    }
    if (isset($input['description'])) {
        $fields[] = 'description = ?';
        $params[] = trim($input['description']);
    }
    if (isset($input['category'])) {
        $fields[] = 'category = ?';
        $params[] = $input['category'];
    }
    if (isset($input['is_public'])) {
        $fields[] = 'is_public = ?';
        $params[] = (bool)$input['is_public'];
    }
    if (isset($input['metadata'])) {
        $fields[] = 'metadata = ?';
        $params[] = json_encode($input['metadata']);
    }
    if (empty($fields)) {
        throw new Exception('No fields to update');
    }
    $params[] = $pgn_id;
    $sql = 'UPDATE pgn_files SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'PGN updated']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
