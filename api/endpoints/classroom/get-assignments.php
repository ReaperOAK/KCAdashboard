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
    
    // Get assignments with submission status for this student
    $query = "SELECT a.id, a.title, a.description, a.due_date, a.created_at,
              CASE 
                WHEN s.id IS NULL THEN 'pending'
                WHEN s.grade IS NULL THEN 'submitted' 
                ELSE 'graded'
              END as status,
              s.submission_date, s.grade, s.feedback, s.submission_file, s.submission_text
              FROM classroom_assignments a
              LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = :student_id
              WHERE a.classroom_id = :classroom_id
              ORDER BY a.due_date ASC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->bindParam(':student_id', $user['id']);
    $stmt->execute();
    
    $assignments = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Format assignment data
        $assignments[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'due_date' => $row['due_date'],
            'created_at' => $row['created_at'],
            'status' => $row['status'],
            'submission_date' => $row['submission_date'],
            'grade' => $row['grade'],
            'feedback' => $row['feedback'],
            'submission_file' => $row['submission_file'],
            'submission_text' => $row['submission_text']
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
