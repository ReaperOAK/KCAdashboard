<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

// Verify token and get user
$user_data = verifyToken();

if (!$user_data) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Get classroom ID from query params
$classroom_id = isset($_GET['classroom_id']) ? intval($_GET['classroom_id']) : null;

if (!$classroom_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Classroom ID is required'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if the user has access to this classroom
    $access_check_query = "";
    $access_params = [];
    
    if ($user_data['role'] === 'teacher') {
        $access_check_query = "
            SELECT id FROM classrooms 
            WHERE id = :classroom_id AND teacher_id = :user_id
        ";
        $access_params = [
            ':classroom_id' => $classroom_id,
            ':user_id' => $user_data['id']
        ];
    } else if ($user_data['role'] === 'student') {
        $access_check_query = "
            SELECT cs.classroom_id FROM classroom_students cs
            WHERE cs.classroom_id = :classroom_id AND cs.student_id = :user_id
        ";
        $access_params = [
            ':classroom_id' => $classroom_id,
            ':user_id' => $user_data['id']
        ];
    } else if ($user_data['role'] === 'admin') {
        // Admins have access to all classrooms
        $access_check_query = "SELECT id FROM classrooms WHERE id = :classroom_id";
        $access_params = [':classroom_id' => $classroom_id];
    }
    
    $stmt = $db->prepare($access_check_query);
    foreach ($access_params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'You do not have access to this classroom'
        ]);
        exit;
    }
    
    // Get all materials for this classroom
    $stmt = $db->prepare("
        SELECT 
            r.id,
            r.title,
            r.description,
            r.type,
            r.url,
            r.created_at,
            u.full_name as created_by_name
        FROM resources r
        JOIN users u ON r.created_by = u.id
        JOIN resource_access ra ON r.id = ra.resource_id
        JOIN classroom_students cs ON ra.user_id = cs.student_id
        WHERE cs.classroom_id = :classroom_id
        AND r.category = 'classroom_material'
        GROUP BY r.id
        ORDER BY r.created_at DESC
    ");
    
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    
    $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates
    foreach ($materials as &$material) {
        $datetime = new DateTime($material['created_at']);
        $material['created_at_formatted'] = $datetime->format('M d, Y h:i A');
    }
    
    echo json_encode([
        'success' => true,
        'materials' => $materials
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching materials: ' . $e->getMessage()
    ]);
}
?>
