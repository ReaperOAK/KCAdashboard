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
    $hasAccess = false;
    
    if ($user['role'] === 'student') {
        $checkAccess = "SELECT c.id FROM classrooms c 
                       JOIN classroom_students cs ON c.id = cs.classroom_id
                       WHERE c.id = :classroom_id AND cs.student_id = :user_id";
        $stmt = $db->prepare($checkAccess);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();
        $hasAccess = $stmt->rowCount() > 0;
    } elseif ($user['role'] === 'teacher') {
        $checkAccess = "SELECT id FROM classrooms WHERE id = :classroom_id AND teacher_id = :user_id";
        $stmt = $db->prepare($checkAccess);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();
        $hasAccess = $stmt->rowCount() > 0;
    } elseif ($user['role'] === 'admin') {
        $checkAccess = "SELECT id FROM classrooms WHERE id = :classroom_id";
        $stmt = $db->prepare($checkAccess);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();
        $hasAccess = $stmt->rowCount() > 0;
    }
      
    if (!$hasAccess) {
        throw new Exception('You do not have access to this classroom');
    }
    
    // Check if classroom_assignments table exists
    $tableExists = false;
    try {
        $checkTableQuery = "SHOW TABLES LIKE 'classroom_assignments'";
        $checkStmt = $db->prepare($checkTableQuery);
        $checkStmt->execute();
        $tableExists = ($checkStmt->rowCount() > 0);
    } catch (PDOException $e) {
        // Ignore errors from this query
    }
    
    // Return empty assignments array if table doesn't exist
    if (!$tableExists) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'assignments' => [],
            'message' => 'Assignments feature not yet available'
        ]);
        exit;
    }
    
    // Only proceed with query if table exists
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
