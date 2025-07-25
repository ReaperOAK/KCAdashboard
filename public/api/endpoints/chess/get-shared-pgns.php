<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
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

    // Get PGNs shared with this user
    $query = "SELECT 
                pf.id,
                pf.title,
                pf.description,
                pf.category,
                pf.is_public,
                pf.teacher_id,
                pf.created_at,
                pf.view_count,
                pf.metadata,
                u.full_name as teacher_name,
                u.email as teacher_email,
                ps.permission,
                ps.shared_at,
                CASE 
                    WHEN pf.pgn_content IS NOT NULL THEN LENGTH(pf.pgn_content)
                    ELSE 0
                END as content_size
              FROM pgn_shares ps
              JOIN pgn_files pf ON ps.pgn_id = pf.id
              JOIN users u ON pf.teacher_id = u.id
              WHERE ps.user_id = ?
              ORDER BY ps.shared_at DESC";
              
    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    $shared_pgns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process results
    $formatted_pgns = [];
    foreach ($shared_pgns as $pgn) {
        $metadata = [];
        if (!empty($pgn['metadata'])) {
            $metadata = json_decode($pgn['metadata'], true) ?: [];
        }
        
        $formatted_pgns[] = [
            'id' => (int)$pgn['id'],
            'title' => $pgn['title'],
            'description' => $pgn['description'],
            'category' => $pgn['category'],
            'is_public' => (bool)$pgn['is_public'],
            'teacher_id' => (int)$pgn['teacher_id'],
            'teacher_name' => $pgn['teacher_name'],
            'teacher_email' => $pgn['teacher_email'],
            'created_at' => $pgn['created_at'],
            'view_count' => (int)$pgn['view_count'],
            'content_size' => (int)$pgn['content_size'],
            'metadata' => $metadata,
            'permission' => $pgn['permission'],
            'shared_at' => $pgn['shared_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'shared_pgns' => $formatted_pgns,
        'total' => count($formatted_pgns)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
