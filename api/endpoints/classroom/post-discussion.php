<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Get request body
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    // Check required fields
    if (!isset($data['classroom_id']) || empty($data['classroom_id']) ||
        !isset($data['message']) || empty($data['message'])) {
        throw new Exception('Classroom ID and message are required');
    }
    
    $classroom_id = $data['classroom_id'];
    $message = $data['message'];
    $parent_id = isset($data['parent_id']) ? $data['parent_id'] : null;
    
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
    
    // If this is a reply, verify parent post exists and belongs to this classroom
    if ($parent_id) {
        $query = "SELECT id FROM classroom_discussions 
                 WHERE id = :parent_id AND classroom_id = :classroom_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('Parent discussion not found in this classroom');
        }
    }
    
    // Insert discussion post
    $query = "INSERT INTO classroom_discussions (classroom_id, user_id, message, parent_id, created_at)
              VALUES (:classroom_id, :user_id, :message, :parent_id, NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->bindParam(':message', $message);
    $stmt->bindParam(':parent_id', $parent_id);
    $stmt->execute();
    
    $post_id = $db->lastInsertId();
    
    // If this is a reply, create notifications for the parent post owner
    if ($parent_id) {
        $query = "INSERT INTO notifications (user_id, title, message, type)
                  SELECT d.user_id,
                         'New reply to your post',
                         CONCAT(:user_name, ' replied to your post in ', c.name),
                         'discussion_reply'
                  FROM classroom_discussions d
                  JOIN classrooms c ON d.classroom_id = c.id
                  WHERE d.id = :parent_id AND d.user_id != :user_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':user_name', $user['full_name']);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();
    } else {
        // For new topics, notify the teacher
        $query = "INSERT INTO notifications (user_id, title, message, type)
                  SELECT c.teacher_id,
                         'New discussion in your classroom',
                         CONCAT(:user_name, ' started a new discussion in ', c.name),
                         'new_discussion'
                  FROM classrooms c
                  WHERE c.id = :classroom_id AND c.teacher_id != :user_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->bindParam(':user_name', $user['full_name']);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();
    }
    
    // Return newly created post with user details
    $query = "SELECT d.id, d.message, d.created_at, 
              u.id as user_id, u.full_name as user_name, u.role as user_role
              FROM classroom_discussions d
              JOIN users u ON d.user_id = u.id
              WHERE d.id = :post_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':post_id', $post_id);
    $stmt->execute();
    
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $parent_id ? 'Reply posted successfully' : 'Discussion posted successfully',
        'post' => $post
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
