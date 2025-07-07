<?php
require_once '../../config/cors.php';


require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../services/NotificationService.php';

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
    
    // Use NotificationService for notifications
    $notificationService = new NotificationService();
    if ($parent_id) {
        // Notify parent post owner (if not self)
        $query = "SELECT d.user_id, c.name as classroom_name FROM classroom_discussions d JOIN classrooms c ON d.classroom_id = c.id WHERE d.id = :parent_id AND d.user_id != :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();
        $parentInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($parentInfo) {
            $notifTitle = 'New reply to your post';
            $notifMsg = $user['full_name'] . ' replied to your post in ' . $parentInfo['classroom_name'];
            $notificationService->sendCustom(
                $parentInfo['user_id'],
                $notifTitle,
                $notifMsg,
                'discussion',
                false
            );
        }
    } else {
        // For new topics, notify the teacher (if not self)
        $query = "SELECT teacher_id, name FROM classrooms WHERE id = :classroom_id AND teacher_id != :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();
        $teacherInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($teacherInfo) {
            $notifTitle = 'New discussion in your classroom';
            $notifMsg = $user['full_name'] . ' started a new discussion in ' . $teacherInfo['name'];
            $notificationService->sendCustom(
                $teacherInfo['teacher_id'],
                $notifTitle,
                $notifMsg,
                'discussion',
                false
            );
        }
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
