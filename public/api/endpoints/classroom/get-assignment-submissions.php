<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'teacher') {
        throw new Exception('Unauthorized access');
    }

    // Check if assignment_id is provided
    if (!isset($_GET['assignment_id']) || empty($_GET['assignment_id'])) {
        throw new Exception('Assignment ID is required');
    }
    
    $assignment_id = $_GET['assignment_id'];
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Verify teacher owns this assignment
    $checkAccess = "
        SELECT a.id, a.title, c.id as classroom_id
        FROM classroom_assignments a
        JOIN classrooms c ON a.classroom_id = c.id
        WHERE a.id = :assignment_id AND c.teacher_id = :user_id
    ";
    $stmt = $db->prepare($checkAccess);
    $stmt->bindParam(':assignment_id', $assignment_id);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('You do not have access to this assignment');
    }
    
    $assignment_info = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get all submissions for this assignment
    $query = "
        SELECT 
            s.id,
            s.student_id,
            u.full_name as student_name,
            u.email as student_email,
            s.submission_text,
            s.submission_file,
            s.submission_date,
            s.grade,
            s.feedback,
            s.status,
            s.graded_at,
            grader.full_name as graded_by_name
        FROM assignment_submissions s
        JOIN users u ON s.student_id = u.id
        LEFT JOIN users grader ON s.graded_by = grader.id
        WHERE s.assignment_id = :assignment_id
        ORDER BY s.submission_date ASC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':assignment_id', $assignment_id);
    $stmt->execute();
    
    $submissions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $submissions[] = [
            'id' => $row['id'],
            'student_id' => $row['student_id'],
            'student_name' => $row['student_name'],
            'student_email' => $row['student_email'],
            'submission_text' => $row['submission_text'],
            'submission_file' => $row['submission_file'],
            'submission_date' => $row['submission_date'],
            'grade' => $row['grade'],
            'feedback' => $row['feedback'],
            'status' => $row['status'],
            'graded_at' => $row['graded_at'],
            'graded_by_name' => $row['graded_by_name']
        ];
    }

    // Get students who haven't submitted yet
    $query = "
        SELECT 
            u.id,
            u.full_name,
            u.email
        FROM classroom_students cs
        JOIN users u ON cs.student_id = u.id
        WHERE cs.classroom_id = :classroom_id
        AND u.id NOT IN (
            SELECT s.student_id 
            FROM assignment_submissions s 
            WHERE s.assignment_id = :assignment_id
        )
        ORDER BY u.full_name
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $assignment_info['classroom_id']);
    $stmt->bindParam(':assignment_id', $assignment_id);
    $stmt->execute();
    
    $not_submitted = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $not_submitted[] = [
            'student_id' => $row['id'],
            'student_name' => $row['full_name'],
            'student_email' => $row['email']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'assignment_title' => $assignment_info['title'],
        'submissions' => $submissions,
        'not_submitted' => $not_submitted,
        'stats' => [
            'total_students' => count($submissions) + count($not_submitted),
            'submitted' => count($submissions),
            'not_submitted' => count($not_submitted),
            'graded' => count(array_filter($submissions, function($s) { return $s['grade'] !== null; }))
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
