<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Fix file paths
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../middleware/auth.php';

try {
    // Validate user token and get user data
    $user = getAuthUser();
    if (!$user) {
        http_response_code(403);
        echo json_encode(['message' => 'Unauthorized access']);
        exit();
    }

    // This endpoint is specifically for students
    if ($user['role'] !== 'student') {
        http_response_code(403);
        echo json_encode(['message' => 'This endpoint is only for students']);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    
    // Get teachers who have PGNs that are accessible to this student
    // (either public PGNs or PGNs shared with this student)
    $query = "SELECT DISTINCT u.id, u.full_name
              FROM users u
              JOIN pgn_files p ON u.id = p.teacher_id
              LEFT JOIN pgn_shares s ON p.id = s.pgn_id AND s.user_id = :student_id
              WHERE u.role = 'teacher' 
              AND u.is_active = 1
              AND (p.is_public = 1 OR s.pgn_id IS NOT NULL)
              ORDER BY u.full_name";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(':student_id', $user['id']);
    $stmt->execute();
    
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return teachers list
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'teachers' => $teachers
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage()
    ]);
}
?>
