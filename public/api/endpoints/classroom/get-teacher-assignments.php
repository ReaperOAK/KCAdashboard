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
    if (!$user || $user['role'] !== 'teacher') {
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

    // Verify teacher owns this classroom
    $checkAccess = "SELECT id FROM classrooms WHERE id = :classroom_id AND teacher_id = :user_id";
    $stmt = $db->prepare($checkAccess);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('You do not have access to this classroom');
    }

    // Get all assignments for this classroom with submission counts
    $query = "
        SELECT 
            a.id,
            a.title,
            a.description,
            a.instructions,
            a.due_date,
            a.points,
            a.assignment_type,
            a.created_at,
            COUNT(s.id) as total_submissions,
            COUNT(CASE WHEN s.grade IS NOT NULL THEN 1 END) as graded_submissions,
            COUNT(cs.student_id) as total_students
        FROM classroom_assignments a
        LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
        LEFT JOIN classroom_students cs ON a.classroom_id = cs.classroom_id
        WHERE a.classroom_id = :classroom_id
        GROUP BY a.id
        ORDER BY a.due_date DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    
    $assignments = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $assignments[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'instructions' => $row['instructions'],
            'due_date' => $row['due_date'],
            'points' => $row['points'],
            'assignment_type' => $row['assignment_type'],
            'created_at' => $row['created_at'],
            'total_submissions' => $row['total_submissions'],
            'graded_submissions' => $row['graded_submissions'],
            'total_students' => $row['total_students'],
            'submission_rate' => $row['total_students'] > 0 ? round(($row['total_submissions'] / $row['total_students']) * 100, 1) : 0
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'assignments' => $assignments
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
