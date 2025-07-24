<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get game ID from URL parameter
    $game_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($game_id <= 0) {
        throw new Exception('Invalid game ID');
    }
    
    // Get current user (but don't fail if not authenticated)
    $current_user = null;
    try {
        $current_user = getAuthUser();
    } catch (Exception $e) {
        error_log("Auth warning in get-game: " . $e->getMessage());
        // Continue without authentication
    }
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Get game details with permission check
    $query = "SELECT 
                pf.id,
                pf.title,
                pf.description,
                pf.category,
                pf.file_path,
                pf.is_public,
                pf.teacher_id,
                pf.created_at,
                pf.metadata,
                u.full_name as teacher_name,
                u.email as teacher_email
              FROM pgn_files pf
              LEFT JOIN users u ON pf.teacher_id = u.id
              WHERE pf.id = ?";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $game_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $game = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$game) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Game not found'
        ]);
        exit();
    }
    
    // Check permissions
    $can_access = false;
    
    if ($game['is_public']) {
        $can_access = true;
    } elseif ($current_user && $current_user['id'] == $game['teacher_id']) {
        $can_access = true;
    } elseif ($current_user && $current_user['role'] === 'admin') {
        $can_access = true;
    }
    
    if (!$can_access) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied'
        ]);
        exit();
    }
    
    // Parse metadata
    $metadata = [];
    if (!empty($game['metadata'])) {
        $metadata = json_decode($game['metadata'], true) ?: [];
    }
    
    // Check if this is a shared game
    $shared_permissions = [];
    if ($current_user) {
        $share_query = "SELECT permission FROM pgn_shares WHERE pgn_id = ? AND user_id = ?";
        $share_stmt = $db->prepare($share_query);
        $share_stmt->execute([$game_id, $current_user['id']]);
        
        $share_data = $share_stmt->fetch(PDO::FETCH_ASSOC);
        if ($share_data) {
            $shared_permissions = [$share_data['permission']];
        }
    }
    
    // Get PGN content - check multiple sources
    $pgn_content = '';
    
    // Check if content is stored in metadata
    $metadata_content = null;
    if (!empty($game['metadata'])) {
        $metadata_obj = json_decode($game['metadata'], true);
        if ($metadata_obj && isset($metadata_obj['pgn_content'])) {
            $metadata_content = $metadata_obj['pgn_content'];
        }
    }
    
    // Priority order: metadata content > file > empty
    if ($metadata_content) {
        $pgn_content = $metadata_content;
    } elseif (!empty($game['file_path'])) {
        $file_full_path = __DIR__ . '/../../' . $game['file_path'];
        if (file_exists($file_full_path)) {
            $pgn_content = file_get_contents($file_full_path);
        }
    }
    
    // Safety check: limit PGN to 50 games to prevent frontend hanging
    if (!empty($pgn_content)) {
        preg_match_all('/\[Event\s*"[^"]*"\]/', $pgn_content, $event_matches, PREG_OFFSET_CAPTURE);
        if (count($event_matches[0]) > 50) {
            // Find the position of the 51st game and cut there
            $cut_position = $event_matches[0][50][1]; // Get offset of 51st Event header
            $pgn_content = substr($pgn_content, 0, $cut_position);
            $pgn_content .= "\n\n[Comment \"Note: This PGN contained " . count($event_matches[0]) . " games. Only showing first 50 games for performance reasons.\"]\n";
        }
    }
    
    // Prepare response
    $response_data = [
        'id' => (int)$game['id'],
        'title' => $game['title'],
        'description' => $game['description'],
        'category' => $game['category'],
        'pgn_content' => $pgn_content,
        'is_public' => (bool)$game['is_public'],
        'teacher_id' => (int)$game['teacher_id'],
        'teacher_name' => $game['teacher_name'],
        'teacher_email' => $game['teacher_email'],
        'created_at' => $game['created_at'],
        'metadata' => $metadata,
        'permissions' => [
            'can_edit' => $current_user && ($current_user['id'] == $game['teacher_id'] || $current_user['role'] === 'admin' || in_array('edit', $shared_permissions)),
            'can_share' => $current_user && ($current_user['id'] == $game['teacher_id'] || $current_user['role'] === 'admin'),
            'can_delete' => $current_user && ($current_user['id'] == $game['teacher_id'] || $current_user['role'] === 'admin')
        ]
    ];
    
    // Track view (optional analytics)
    if ($current_user) {
        try {
            $view_query = "INSERT INTO pgn_views (pgn_id, user_id, viewed_at) VALUES (?, ?, NOW()) 
                          ON DUPLICATE KEY UPDATE viewed_at = NOW()";
            $view_stmt = $db->prepare($view_query);
            $view_stmt->execute([$game_id, $current_user['id']]);
        } catch (Exception $e) {
            // Ignore view tracking errors
            error_log("View tracking error: " . $e->getMessage());
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $response_data
    ]);
    
} catch (Exception $e) {
    error_log("Get game error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve game',
        'error' => $e->getMessage()
    ]);
}
?>
