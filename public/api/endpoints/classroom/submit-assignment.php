<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    // Ensure user is a student
    if ($user['role'] !== 'student') {
        throw new Exception('Only students can submit assignments');
    }
    
    // Check if required fields are provided
    if (!isset($_POST['assignment_id']) || empty($_POST['assignment_id']) || 
        !isset($_POST['classroom_id']) || empty($_POST['classroom_id'])) {
        throw new Exception('Missing required fields');
    }
    
    $assignment_id = $_POST['assignment_id'];
    $classroom_id = $_POST['classroom_id'];
    $submission_text = isset($_POST['submission_text']) ? $_POST['submission_text'] : '';
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify student is enrolled in the class
    $query = "SELECT cs.classroom_id 
              FROM classroom_students cs
              WHERE cs.classroom_id = :classroom_id AND cs.student_id = :student_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->bindParam(':student_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('You are not enrolled in this class');
    }
    
    // Verify assignment belongs to the classroom
    $query = "SELECT id FROM classroom_assignments 
              WHERE id = :assignment_id AND classroom_id = :classroom_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':assignment_id', $assignment_id);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('Assignment not found for this classroom');
    }
    
    // Check if assignment is already submitted
    $query = "SELECT id FROM assignment_submissions 
              WHERE assignment_id = :assignment_id AND student_id = :student_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':assignment_id', $assignment_id);
    $stmt->bindParam(':student_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        throw new Exception('You have already submitted this assignment');
    }
      // Handle file upload if present
    $submission_file = null;
    if (isset($_FILES['submission_file']) && $_FILES['submission_file']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../../../uploads/assignments/';
        
        // Create directory if it doesn't exist
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        $file_info = pathinfo($_FILES['submission_file']['name']);
        $file_extension = strtolower($file_info['extension']);
        
        // Allow only specific file types
        $allowed_extensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'pgn'];
        if (!in_array($file_extension, $allowed_extensions)) {
            throw new Exception('Invalid file type. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG, PGN');
        }
        
        // Generate unique filename
        $unique_filename = uniqid() . '_' . $user['id'] . '.' . $file_extension;
        $upload_path = $upload_dir . $unique_filename;
        
        if (move_uploaded_file($_FILES['submission_file']['tmp_name'], $upload_path)) {
            $submission_file = $unique_filename;
        } else {
            throw new Exception('Failed to upload file');
        }
    }
    
    // Make sure at least one submission method is used
    if (empty($submission_file) && empty($submission_text)) {
        throw new Exception('Please provide either a file or text submission');
    }
    
    // Insert submission into database
    $query = "INSERT INTO assignment_submissions (assignment_id, student_id, submission_file, submission_text, submission_date)
              VALUES (:assignment_id, :student_id, :submission_file, :submission_text, NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':assignment_id', $assignment_id);
    $stmt->bindParam(':student_id', $user['id']);
    $stmt->bindParam(':submission_file', $submission_file);
    $stmt->bindParam(':submission_text', $submission_text);
    $stmt->execute();
    
    // Create notification for teacher
    $query = "INSERT INTO notifications (user_id, title, message, type)
              SELECT c.teacher_id, 
                     CONCAT('New submission for ', a.title),
                     CONCAT(:student_name, ' has submitted an assignment for ', a.title),
                     'assignment_submission'
              FROM classroom_assignments a
              JOIN classrooms c ON a.classroom_id = c.id
              WHERE a.id = :assignment_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':assignment_id', $assignment_id);
    $stmt->bindParam(':student_name', $user['full_name']);
    $stmt->execute();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Assignment submitted successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
