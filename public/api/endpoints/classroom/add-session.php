<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';

require_once '../../middleware/auth.php';
require_once '../../models/Notification.php';
require_once '../../services/NotificationService.php';

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
    $duration = isset($data['duration']) ? (int)$data['duration'] : 60;
    $end_time = date('Y-m-d H:i:s', strtotime($date_time) + $duration * 60);

    // Check if date is in the past
    $session_datetime = new DateTime($date_time, new DateTimeZone('Asia/Kolkata'));
    $current_datetime = new DateTime('now', new DateTimeZone('Asia/Kolkata'));
    
    if ($session_datetime <= $current_datetime) {
        echo json_encode([
            'success' => false,
            'message' => 'Cannot schedule a class in the past. Please select a future date and time.'
        ]);
        exit;
    }

    // Check for overlapping sessions for this teacher
    $overlap_stmt = $db->prepare("
        SELECT bs.id FROM batch_sessions bs
        JOIN classrooms c ON bs.batch_id = c.id
        WHERE c.teacher_id = :teacher_id
          AND (
            (bs.date_time < :end_time AND DATE_ADD(bs.date_time, INTERVAL bs.duration MINUTE) > :start_time)
          )
    ");
    $overlap_stmt->bindParam(':teacher_id', $user_data['id']);
    $overlap_stmt->bindParam(':start_time', $date_time);
    $overlap_stmt->bindParam(':end_time', $end_time);
    $overlap_stmt->execute();
    if ($overlap_stmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'You already have a class scheduled that overlaps with this time.'
        ]);
        exit;
    }

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
    $stmt->bindParam(':duration', $duration);
    $stmt->bindParam(':type', $data['type']);
    $stmt->bindParam(':meeting_link', $data['meeting_link']);
    $stmt->execute();
    $session_id = $db->lastInsertId();
    
    // Generate notifications for all students in this classroom using NotificationService
    $notif_title = "New Class Scheduled";
    $notif_message = "A new class '{$data['title']}' has been scheduled on " . date('M d, Y', strtotime($data['date'])) . " at " . date('h:i A', strtotime($data['time']));
    $notificationService = new NotificationService();
    // Get all student IDs in the classroom
    $studentStmt = $db->prepare("SELECT student_id FROM classroom_students WHERE classroom_id = :classroom_id");
    $studentStmt->bindParam(':classroom_id', $data['classroom_id']);
    $studentStmt->execute();
    $studentIds = $studentStmt->fetchAll(PDO::FETCH_COLUMN);
    if (!empty($studentIds)) {
        $notificationService->sendBulkCustom($studentIds, $notif_title, $notif_message, 'class_scheduled');
    }
    
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
