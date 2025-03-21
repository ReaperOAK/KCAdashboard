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
    
    // Get classroom details and check if user has access
    $checkAccess = "SELECT c.id FROM classrooms c 
                   JOIN classroom_students cs ON c.id = cs.classroom_id
                   WHERE c.id = :classroom_id AND cs.student_id = :student_id";
    
    // For teachers, check if they teach this class
    if ($user['role'] === 'teacher') {
        $checkAccess = "SELECT id FROM classrooms WHERE id = :classroom_id AND teacher_id = :student_id";
    }
    
    // For admins, allow access to any classroom
    if ($user['role'] === 'admin') {
        $checkAccess = "SELECT id FROM classrooms WHERE id = :classroom_id";
    }
    
    $stmt = $db->prepare($checkAccess);
    $stmt->bindParam(':classroom_id', $classroom_id);
    
    // Only bind student_id for non-admin roles
    if ($user['role'] !== 'admin') {
        $stmt->bindParam(':student_id', $user['id']);
    }
    
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('You do not have access to this classroom');
    }
    
    // Get material list
    $query = "SELECT r.id, r.title, r.description, r.type, r.url, r.category, r.created_at,
              u.full_name AS uploaded_by
              FROM resources r
              JOIN users u ON r.created_by = u.id
              JOIN classroom_resources cr ON r.id = cr.resource_id
              WHERE cr.classroom_id = :classroom_id
              ORDER BY r.created_at DESC";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    
    $materials = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Process URL path if needed based on type
        if ($row['type'] === 'pdf' || $row['type'] === 'pgn') {
            // Store just the filename in the database, construct full path here
            if (!preg_match('/^https?:\/\//', $row['url'])) {
                $row['full_url'] = '/uploads/materials/' . $row['url'];
            }
        }
        
        $materials[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'type' => $row['type'],
            'url' => $row['url'],
            'category' => $row['category'],
            'uploaded_by' => $row['uploaded_by'],
            'created_at' => $row['created_at']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'materials' => $materials
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
