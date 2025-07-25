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
        throw new Exception('Missing required field: pgn_id');
    }
    
    $pgn_id = (int)$input['pgn_id'];
    $user_ids = $input['user_ids'] ?? []; // Array of individual user IDs
    $batch_ids = $input['batch_ids'] ?? []; // Array of batch IDs
    $permission = $input['permission'] ?? 'view'; // 'view' or 'edit'
    
    // Validate permission
    if (!in_array($permission, ['view', 'edit'])) {
        throw new Exception('Invalid permission. Must be "view" or "edit"');
    }

    // Must have at least one target (users or batches)
    if (empty($user_ids) && empty($batch_ids)) {
        throw new Exception('Must specify either user_ids or batch_ids for sharing');
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

    $db->beginTransaction();
    
    try {
        $all_user_ids = $user_ids; // Start with directly specified users
        
        // Get users from batches if batch_ids are specified
        if (!empty($batch_ids)) {
            $placeholders = str_repeat('?,', count($batch_ids) - 1) . '?';
            $batch_users_query = "SELECT DISTINCT bs.student_id 
                                 FROM batch_students bs 
                                 JOIN batches b ON bs.batch_id = b.id
                                 WHERE bs.batch_id IN ($placeholders) 
                                 AND bs.status = 'active'
                                 AND b.status = 'active'";
            
            $batch_users_stmt = $db->prepare($batch_users_query);
            $batch_users_stmt->execute($batch_ids);
            
            $batch_user_ids = $batch_users_stmt->fetchAll(PDO::FETCH_COLUMN);
            $all_user_ids = array_merge($all_user_ids, $batch_user_ids);
        }
        
        // Remove duplicates and filter out invalid user IDs
        $all_user_ids = array_unique(array_filter($all_user_ids));
        
        if (empty($all_user_ids)) {
            throw new Exception('No valid users found to share with');
        }

        // Validate that all user IDs exist and are active
        $placeholders = str_repeat('?,', count($all_user_ids) - 1) . '?';
        $validate_users_stmt = $db->prepare("SELECT id FROM users WHERE id IN ($placeholders) AND is_active = 1");
        $validate_users_stmt->execute($all_user_ids);
        $valid_user_ids = $validate_users_stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($valid_user_ids) !== count($all_user_ids)) {
            $invalid_count = count($all_user_ids) - count($valid_user_ids);
            error_log("Warning: $invalid_count invalid user IDs filtered out during PGN sharing");
        }
        
        $all_user_ids = $valid_user_ids;
        
        if (empty($all_user_ids)) {
            throw new Exception('No valid active users found to share with');
        }

        // Remove existing shares for this PGN to these users (to avoid duplicates)
        $delete_placeholders = str_repeat('?,', count($all_user_ids) - 1) . '?';
        $delete_stmt = $db->prepare("DELETE FROM pgn_shares WHERE pgn_id = ? AND user_id IN ($delete_placeholders)");
        $delete_params = array_merge([$pgn_id], $all_user_ids);
        $delete_stmt->execute($delete_params);
        
        // Insert new shares
        $share_stmt = $db->prepare('INSERT INTO pgn_shares (pgn_id, user_id, permission) VALUES (?, ?, ?)');
        $shared_count = 0;
        
        foreach ($all_user_ids as $share_user_id) {
            $share_stmt->execute([$pgn_id, $share_user_id, $permission]);
            $shared_count++;
        }
        
        $db->commit();
        
        $message_parts = [];
        if (!empty($user_ids)) {
            $message_parts[] = count($user_ids) . ' individual user(s)';
        }
        if (!empty($batch_ids)) {
            $batch_student_count = count($batch_user_ids ?? []);
            $message_parts[] = count($batch_ids) . ' batch(es) (' . $batch_student_count . ' students)';
        }
        
        $share_summary = implode(' and ', $message_parts);
        
        echo json_encode([
            'success' => true,
            'message' => "PGN study '{$pgn['title']}' shared with {$share_summary}",
            'shared_count' => $shared_count,
            'permission' => $permission,
            'details' => [
                'individual_users' => count($user_ids),
                'batches' => count($batch_ids),
                'total_recipients' => $shared_count
            ]
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
