<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    // Check if classroom_id is provided
    if (!isset($_GET['classroom_id']) || empty($_GET['classroom_id'])) {
        throw new Exception('Classroom ID is required');
    }
    
    $classroom_id = $_GET['classroom_id'];
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Check access to classroom
    $checkAccess = "SELECT c.id FROM classrooms c 
                   LEFT JOIN classroom_students cs ON c.id = cs.classroom_id AND cs.student_id = :user_id
                   WHERE c.id = :classroom_id AND (cs.student_id IS NOT NULL OR c.teacher_id = :user_id)";
                   
    // For admins, allow access to any classroom
    if ($user['role'] === 'admin') {
        $checkAccess = "SELECT id FROM classrooms WHERE id = :classroom_id";
    }
    
    $stmt = $db->prepare($checkAccess);
    $stmt->bindParam(':classroom_id', $classroom_id);
    
    // Only bind user_id for non-admin roles
    if ($user['role'] !== 'admin') {
        $stmt->bindParam(':user_id', $user['id']);
    }
    
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('You do not have access to this classroom');
    }
    
    // Get discussions for this classroom
    $query = "SELECT d.id, d.message, d.created_at, 
              u.id as user_id, u.full_name as user_name, u.role as user_role
              FROM classroom_discussions d
              JOIN users u ON d.user_id = u.id
              WHERE d.classroom_id = :classroom_id AND d.parent_id IS NULL
              ORDER BY d.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    
    $discussions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Get replies to this discussion
        $replyQuery = "SELECT r.id, r.message, r.created_at,
                      u.id as user_id, u.full_name as user_name, u.role as user_role
                      FROM classroom_discussions r
                      JOIN users u ON r.user_id = u.id
                      WHERE r.parent_id = :parent_id
                      ORDER BY r.created_at ASC";
                      
        $replyStmt = $db->prepare($replyQuery);
        $replyStmt->bindParam(':parent_id', $row['id']);
        $replyStmt->execute();
        
        $replies = [];
        while ($replyRow = $replyStmt->fetch(PDO::FETCH_ASSOC)) {
            $replies[] = [
                'id' => $replyRow['id'],
                'message' => $replyRow['message'],
                'created_at' => $replyRow['created_at'],
                'user_id' => $replyRow['user_id'],
                'user_name' => $replyRow['user_name'],
                'user_role' => $replyRow['user_role']
            ];
        }
        
        // Add discussion with replies
        $discussions[] = [
            'id' => $row['id'],
            'message' => $row['message'],
            'created_at' => $row['created_at'],
            'user_id' => $row['user_id'],
            'user_name' => $row['user_name'],
            'user_role' => $row['user_role'],
            'replies' => $replies
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'discussions' => $discussions
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
