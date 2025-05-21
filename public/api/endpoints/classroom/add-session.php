<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

// Get JSON request data
$data = json_decode(file_get_contents("php://input"), true);

// Verify token and get user
$user_data = verifyToken();

if (!$user_data || $user_data['role'] !== 'teacher') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Validate required fields
if (!isset($data['classroom_id']) || !isset($data['title']) || 
    !isset($data['date']) || !isset($data['time'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // First, verify that this teacher owns this classroom
    $stmt = $db->prepare("
        SELECT id FROM classrooms 
        WHERE id = :classroom_id AND teacher_id = :teacher_id
    ");
    $stmt->bindParam(':classroom_id', $data['classroom_id']);
    $stmt->bindParam(':teacher_id', $user_data['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'You do not have permission to schedule sessions for this classroom'
        ]);
        exit;
    }
    
    // Combine date and time
    $date_time = $data['date'] . ' ' . $data['time'];
    
    // Insert the session
    $stmt = $db->prepare("
        INSERT INTO batch_sessions (
            batch_id, title, date_time, duration, type, 
            meeting_link, created_at
        ) VALUES (
            :batch_id, :title, :date_time, :duration, :type, 
            :meeting_link, NOW()
        )
    ");
    
    $stmt->bindParam(':batch_id', $data['classroom_id']);
    $stmt->bindParam(':title', $data['title']);
    $stmt->bindParam(':date_time', $date_time);
    $stmt->bindParam(':duration', $data['duration']);
    $stmt->bindParam(':type', $data['type']);
    $stmt->bindParam(':meeting_link', $data['meeting_link']);
    
    $stmt->execute();
    $session_id = $db->lastInsertId();
    
    // Generate notifications for all students in this classroom
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, created_at)
        SELECT 
            cs.student_id,
            :notif_title,
            :notif_message,
            'class_scheduled',
            NOW()
        FROM classroom_students cs
        WHERE cs.classroom_id = :classroom_id
    ");
    
    $notif_title = "New Class Scheduled";
    $notif_message = "A new class '{$data['title']}' has been scheduled on " . date('M d, Y', strtotime($data['date'])) . " at " . date('h:i A', strtotime($data['time']));
    
    $stmt->bindParam(':notif_title', $notif_title);
    $stmt->bindParam(':notif_message', $notif_message);
    $stmt->bindParam(':classroom_id', $data['classroom_id']);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Class session scheduled successfully',
        'session_id' => $session_id
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error scheduling class: ' . $e->getMessage()
    ]);
}
?>
