<?php
require_once '../../config/cors.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../services/NotificationService.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'teacher') {
        throw new Exception('Unauthorized access');
    }

    // Get JSON data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validate required fields
    if (!isset($data['submission_id']) || !isset($data['grade']) || !isset($data['feedback'])) {
        throw new Exception('Missing required fields: submission_id, grade, feedback');
    }

    $submission_id = $data['submission_id'];
    $grade = floatval($data['grade']);
    $feedback = $data['feedback'];

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Verify teacher has access to this submission
    $checkQuery = "
        SELECT s.id, s.student_id, s.assignment_id, u.full_name as student_name, a.title as assignment_title
        FROM assignment_submissions s
        JOIN classroom_assignments a ON s.assignment_id = a.id
        JOIN classrooms c ON a.classroom_id = c.id
        JOIN users u ON s.student_id = u.id
        WHERE s.id = :submission_id AND c.teacher_id = :teacher_id
    ";
    
    $stmt = $db->prepare($checkQuery);
    $stmt->bindParam(':submission_id', $submission_id);
    $stmt->bindParam(':teacher_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('You do not have access to this submission');
    }
    
    $submission_info = $stmt->fetch(PDO::FETCH_ASSOC);

    // Update the submission with grade and feedback
    $updateQuery = "
        UPDATE assignment_submissions 
        SET grade = :grade, 
            feedback = :feedback, 
            graded_by = :graded_by, 
            graded_at = NOW(),
            status = 'graded'
        WHERE id = :submission_id
    ";
    
    $stmt = $db->prepare($updateQuery);
    $stmt->bindParam(':grade', $grade);
    $stmt->bindParam(':feedback', $feedback);
    $stmt->bindParam(':graded_by', $user['id']);
    $stmt->bindParam(':submission_id', $submission_id);
    $stmt->execute();


    // Send notification using NotificationService
    $notificationService = new NotificationService();
    $notification_title = 'Assignment Graded: ' . $submission_info['assignment_title'];
    $notification_message = 'Your assignment "' . $submission_info['assignment_title'] . '" has been graded. Grade: ' . $grade;
    $notificationService->sendCustom(
        $submission_info['student_id'],
        $notification_title,
        $notification_message,
        'assignment', // category
        false // sendEmail
    );

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Assignment graded successfully',
        'graded_submission' => [
            'submission_id' => $submission_id,
            'student_name' => $submission_info['student_name'],
            'assignment_title' => $submission_info['assignment_title'],
            'grade' => $grade,
            'feedback' => $feedback,
            'graded_by' => $user['full_name'],
            'graded_at' => date('Y-m-d H:i:s')
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
