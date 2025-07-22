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
    // Get current user (but don't fail if not authenticated)
    $current_user = null;
    try {
        $current_user = getAuthUser();
    } catch (Exception $e) {
        error_log("Auth warning: " . $e->getMessage());
        // Continue without authentication
    }
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }
    
    // Check if pgn_files table exists
    $table_check = $db->query("SHOW TABLES LIKE 'pgn_files'");
    if ($table_check->rowCount() === 0) {
        // Table doesn't exist, return empty result
        echo json_encode([
            'success' => true,
            'data' => [],
            'total' => 0,
            'message' => 'PGN files table not found. Please initialize the database.'
        ]);
        exit();
    }
    
    // Get query parameters for filtering only
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $public_only = isset($_GET['public_only']) ? (bool)$_GET['public_only'] : false;
    $user_only = isset($_GET['user_only']) ? (bool)$_GET['user_only'] : false;
    $resource_category = isset($_GET['resource_category']) ? $_GET['resource_category'] : 'public';
    
    // Build base query
    $where_conditions = [];
    $params = [];
    
    // Category filter
    if (!empty($category)) {
        $valid_categories = ['opening', 'middlegame', 'endgame', 'tactics', 'strategy'];
        if (in_array($category, $valid_categories)) {
            $where_conditions[] = "category = ?";
            $params[] = $category;
        }
    }
    
    // Search filter - use LIKE search for compatibility
    if (!empty($search)) {
        $where_conditions[] = "(title LIKE ? OR description LIKE ?)";
        $search_param = '%' . $search . '%';
        $params[] = $search_param;
        $params[] = $search_param;
    }
    
    // Public/private filter based on resource category
    if ($resource_category === 'public') {
        // Public Resources - visible to all authenticated users
        $where_conditions[] = "is_public = 1";
    } elseif ($resource_category === 'private' && $current_user) {
        // My Private Resources - only for teachers/admins, their own private resources
        if (in_array($current_user['role'], ['teacher', 'admin'])) {
            $where_conditions[] = "teacher_id = ? AND is_public = 0";
            $params[] = $current_user['id'];
        } else {
            // Students can't access private resources
            $where_conditions[] = "1 = 0"; // No results
        }
    } elseif ($resource_category === 'shared' && $current_user) {
        // My Shared Resources - for teachers/admins, their public resources (shared but not private)
        if (in_array($current_user['role'], ['teacher', 'admin'])) {
            $where_conditions[] = "teacher_id = ? AND is_public = 1";
            $params[] = $current_user['id'];
        } else {
            // Students can't access this category
            $where_conditions[] = "1 = 0"; // No results
        }
    } elseif ($resource_category === 'coach' && $current_user) {
        // Resources Categorised by Coach - only for authorized admins
        if ($current_user['role'] === 'admin') {
            // Check if admin has permission to access coach resources
            // For now, we'll assume all admins can access, but this should be permission-based
            $where_conditions[] = "1 = 1"; // Show all resources for now
            // TODO: Add specific permission check for coach resources
        } else {
            // Non-admins can't access coach resources
            $where_conditions[] = "1 = 0"; // No results
        }
    } elseif ($public_only) {
        $where_conditions[] = "is_public = 1";
    } elseif ($user_only && $current_user) {
        $where_conditions[] = "teacher_id = ?";
        $params[] = $current_user['id'];
    } elseif (!$current_user) {
        // Non-authenticated users can only see public PGNs
        $where_conditions[] = "is_public = 1";
        error_log("get-games: No authenticated user, showing only public PGNs");
    } else {
        // Default: Authenticated users can see public PGNs and their own
        $where_conditions[] = "(is_public = 1 OR teacher_id = ?)";
        $params[] = $current_user['id'];
        error_log("get-games: Authenticated user " . $current_user['id'] . ", showing public + own PGNs");
    }
    
    $where_clause = empty($where_conditions) ? '' : 'WHERE ' . implode(' AND ', $where_conditions);
    
    // Get all results (no pagination on server side)
    $query = "SELECT 
                pf.id,
                pf.title,
                pf.description,
                pf.category,
                pf.file_path,
                pf.is_public,
                pf.created_at,
                pf.metadata,
                u.full_name as teacher_name,
                u.email as teacher_email
              FROM pgn_files pf
              LEFT JOIN users u ON pf.teacher_id = u.id
              {$where_clause}
              ORDER BY pf.created_at DESC";
    
    $stmt = $db->prepare($query);
    if (!empty($params)) {
        $stmt->execute($params);
    } else {
        $stmt->execute();
    }
    
    error_log("get-games: Query executed, WHERE clause: " . $where_clause);
    error_log("get-games: Params: " . json_encode($params));
    
    $games = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Parse metadata
        $metadata = [];
        if (!empty($row['metadata'])) {
            $metadata = json_decode($row['metadata'], true) ?: [];
        }
        
        $games[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'category' => $row['category'],
            'is_public' => (bool)$row['is_public'],
            'teacher_name' => $row['teacher_name'],
            'teacher_email' => $row['teacher_email'],
            'created_at' => $row['created_at'],
            'file_path' => $row['file_path'],
            'metadata' => $metadata
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $games,
        'total' => count($games),
        'filters' => [
            'category' => $category,
            'search' => $search,
            'public_only' => $public_only,
            'user_only' => $user_only
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Get games error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve games',
        'error' => $e->getMessage()
    ]);
}
?>
