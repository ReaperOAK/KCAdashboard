<?php
// api/endpoints/classroom/create-meeting-session.php
// Create a new online meeting session for a batch using the stored meeting link

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/Classroom.php';
require_once '../../services/NotificationService.php';

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Verify JWT token
$user = verifyToken();
if (!$user) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized'
    ]);
    exit();
}

// Only teachers and admins can create meeting sessions
if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'message' => 'Permission denied. Only teachers and admins can create meeting sessions.'
    ]);
    exit();
}

// Get raw posted data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['batch_id']) || !isset($data['title']) || 
    !isset($data['scheduled_time']) || !isset($data['duration_minutes'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: batch_id, title, scheduled_time, duration_minutes'
    ]);
    exit();
}

// Database connection and model initialization
$database = new Database();
$db = $database->connect();
$classroom = new Classroom($db);

// Check if teacher has access to the batch (if not admin)
if ($user['role'] === 'teacher') {
    $query = "SELECT 1 FROM batches WHERE id = :batch_id AND teacher_id = :teacher_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':batch_id', $data['batch_id']);
    $stmt->bindParam(':teacher_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Permission denied. You are not the teacher for this batch.'
        ]);
        exit();
    }
}

// Create the meeting session
$result = $classroom->createMeeting($data);

if ($result['success']) {
    // Notify students about the new meeting session
    try {
        $notificationService = new NotificationService($db);
        
        // Get all students in the batch
        $studentIds = $classroom->getBatchStudentIds($data['batch_id']);
        
        // Get batch details for notification
        $batchDetails = $classroom->getBatchDetails($data['batch_id']);
        $teacherDetails = $classroom->getTeacherDetails($user['id']);
        
        if (!empty($studentIds)) {
            $formattedTime = date('M j, Y, g:i A', strtotime($data['scheduled_time']));
            
            $notificationText = "New online class: {$data['title']} for {$batchDetails['name']} " .
                               "with {$teacherDetails['full_name']} on {$formattedTime}";
            
            // Send notification to all students in the batch
            foreach ($studentIds as $studentId) {
                $notificationService->createNotification(
                    $studentId,
                    'class_scheduled',
                    $notificationText,
                    ['batch_id' => $data['batch_id'], 'session_id' => $result['id']],
                    $user['id']
                );
            }
        }
    } catch (Exception $e) {
        // Log the error but continue - notifications are not critical
        error_log("Error sending notifications: " . $e->getMessage());
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Meeting session created successfully',
        'data' => $result
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => $result['message'] ?? 'Failed to create meeting session'
    ]);
}
?>