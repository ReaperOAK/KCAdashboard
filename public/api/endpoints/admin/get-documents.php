<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Authenticate and verify admin role
    $currentUser = getAuthUser();
    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit;
    }
    
    if ($currentUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Admin access required']);
        exit;
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Get filter parameters
    $status = $_GET['status'] ?? 'all'; // all, pending, verified, rejected
    $document_type = $_GET['document_type'] ?? 'all';
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 20);
    $offset = ($page - 1) * $limit;

    // Build WHERE clause
    $whereConditions = [];
    $params = [];

    if ($status === 'pending') {
        $whereConditions[] = "ud.is_verified = 0";
    } elseif ($status === 'verified') {
        $whereConditions[] = "ud.is_verified = 1";
    }

    if ($document_type !== 'all') {
        $whereConditions[] = "ud.document_type = ?";
        $params[] = $document_type;
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Get documents with user information
    $sql = "
        SELECT 
            ud.id,
            ud.user_id,
            ud.document_type,
            ud.file_name,
            ud.file_path,
            ud.file_size,
            ud.mime_type,
            ud.uploaded_at,
            ud.is_verified,
            ud.verified_by,
            ud.verified_at,
            u.full_name as user_name,
            u.email as user_email,
            u.role as user_role,
            verifier.full_name as verified_by_name
        FROM user_documents ud
        JOIN users u ON ud.user_id = u.id
        LEFT JOIN users verifier ON ud.verified_by = verifier.id
        $whereClause
        ORDER BY ud.uploaded_at DESC
        LIMIT ? OFFSET ?
    ";

    $params[] = $limit;
    $params[] = $offset;

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count for pagination
    $countSql = "
        SELECT COUNT(*) as total
        FROM user_documents ud
        JOIN users u ON ud.user_id = u.id
        $whereClause
    ";
    
    $countParams = array_slice($params, 0, -2); // Remove limit and offset
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($countParams);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        'success' => true,
        'documents' => $documents,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => ceil($totalCount / $limit),
            'total_count' => (int)$totalCount,
            'per_page' => $limit
        ]
    ]);

} catch (Exception $e) {
    error_log("Admin get documents error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
