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
    if (!$input || empty($input['pgn_id']) || empty($input['user_ids'])) {
        throw new Exception('Missing required fields: pgn_id and user_ids');
    }
    
    $pgn_id = (int)$input['pgn_id'];
    $user_ids = $input['user_ids']; // Array of user IDs
    $permission = $input['permission'] ?? 'view'; // 'view' or 'edit'
    
    // Validate permission
    if (!in_array($permission, ['view', 'edit'])) {
        throw new Exception('Invalid permission. Must be "view" or "edit"');
    }

    $current_user = getAuthUser();
    if (!$current_user) {
        throw new Exception('Unauthorized');
    }
    
    $user_id = $current_user['id'];
    $user_role = $current_user['role'];
    
    // Only teachers and admins can share PGNs
    if (!in_array($user_role, ['teacher', 'admin'])) {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Only teachers and admins can share PGN studies. Students cannot share content.'
        ]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Check if PGN exists and get its details
    $stmt = $db->prepare('SELECT teacher_id, is_public, title FROM pgn_files WHERE id = ?');
    $stmt->execute([$pgn_id]);
    $pgn = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$pgn) {
        throw new Exception('PGN not found');
    }

    // Permission check: Only the owner, admin, or if it's public can share
    $can_share = false;
    if ($user_role === 'admin') {
        $can_share = true;
    } elseif ($user_id == $pgn['teacher_id']) {
        $can_share = true; // Owner can always share
    } elseif ($pgn['is_public'] && $user_role === 'teacher') {
        $can_share = true; // Teachers can share public PGNs
    }
    
    if (!$can_share) {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'You do not have permission to share this PGN study'
        ]);
        exit();
    }

    // Validate user IDs exist and are not students if sharing private content
    if (!$pgn['is_public']) {
        // For private PGNs, we might want to restrict who can receive them
        $placeholders = str_repeat('?,', count($user_ids) - 1) . '?';
        $stmt = $db->prepare("SELECT id, role FROM users WHERE id IN ($placeholders) AND is_active = 1");
        $stmt->execute($user_ids);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($users) !== count($user_ids)) {
            throw new Exception('One or more user IDs are invalid or inactive');
        }
    }

    $db->beginTransaction();
    
    try {
        // Remove existing shares for this PGN to these users (to avoid duplicates)
        $placeholders = str_repeat('?,', count($user_ids) - 1) . '?';
        $delete_stmt = $db->prepare("DELETE FROM pgn_shares WHERE pgn_id = ? AND user_id IN ($placeholders)");
        $delete_params = array_merge([$pgn_id], $user_ids);
        $delete_stmt->execute($delete_params);
        
        // Insert new shares
        $share_stmt = $db->prepare('INSERT INTO pgn_shares (pgn_id, user_id, permission) VALUES (?, ?, ?)');
        $shared_count = 0;
        
        foreach ($user_ids as $share_user_id) {
            $share_stmt->execute([$pgn_id, $share_user_id, $permission]);
            $shared_count++;
        }
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => "PGN study '{$pgn['title']}' shared with {$shared_count} user(s)",
            'shared_count' => $shared_count,
            'permission' => $permission
        ]);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
