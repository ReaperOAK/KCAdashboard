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
    !isset($data['start_date']) || !isset($data['schedule'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: classroom_id, title, start_date, schedule'
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
    
    // Parse schedule
    $schedule = $data['schedule'];
    if (is_string($schedule)) {
        $schedule = json_decode($schedule, true);
    }
    
    if (!isset($schedule['days']) || !is_array($schedule['days']) || count($schedule['days']) === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid schedule: no days specified'
        ]);
        exit;
    }
    
    // Calculate session parameters
    $start_date = new DateTime($data['start_date']);
    $num_weeks = isset($data['num_weeks']) ? (int)$data['num_weeks'] : 4;
    $duration = isset($data['duration']) ? (int)$data['duration'] : ($schedule['duration'] ?? 60);
    $session_time = $schedule['time'] ?? '09:00';
    $type = $data['type'] ?? 'offline';
    $meeting_link = $data['meeting_link'] ?? '';
    $description = $data['description'] ?? '';
    $title_template = $data['title'];
    
    // Calculate end date
    if (isset($data['end_date']) && !empty($data['end_date'])) {
        $end_date = new DateTime($data['end_date']);
    } else {
        $end_date = clone $start_date;
        $end_date->add(new DateInterval("P{$num_weeks}W"));
    }
    
    // Day name to number mapping
    $day_map = [
        'Sun' => 0, 'Mon' => 1, 'Tue' => 2, 'Wed' => 3, 
        'Thu' => 4, 'Fri' => 5, 'Sat' => 6
    ];
    
    // Generate session dates
    $session_dates = [];
    $current_date = clone $start_date;
    $week_number = 1;
    
    while ($current_date <= $end_date) {
        $day_name = $current_date->format('D');
        
        if (in_array($day_name, $schedule['days'])) {
            // Create session date/time
            $session_datetime = clone $current_date;
            $time_parts = explode(':', $session_time);
            $session_datetime->setTime((int)$time_parts[0], (int)$time_parts[1]);
            
            // Check for overlapping sessions for this teacher
            $overlap_stmt = $db->prepare("
                SELECT bs.id FROM batch_sessions bs
                JOIN classrooms c ON bs.batch_id = c.id
                WHERE c.teacher_id = :teacher_id
                  AND (
                    (bs.date_time < :end_time AND DATE_ADD(bs.date_time, INTERVAL bs.duration MINUTE) > :start_time)
                  )
            ");
            $session_end = clone $session_datetime;
            $session_end->add(new DateInterval("PT{$duration}M"));
            
            $overlap_stmt->bindParam(':teacher_id', $user_data['id']);
            $overlap_stmt->bindValue(':start_time', $session_datetime->format('Y-m-d H:i:s'));
            $overlap_stmt->bindValue(':end_time', $session_end->format('Y-m-d H:i:s'));
            $overlap_stmt->execute();
            
            if ($overlap_stmt->rowCount() === 0) {
                $session_dates[] = [
                    'datetime' => $session_datetime,
                    'week' => $week_number,
                    'date_str' => $session_datetime->format('M j, Y')
                ];
            }
        }
        
        // Move to next day
        $current_date->add(new DateInterval('P1D'));
        
        // Increment week number on Sundays
        if ($current_date->format('w') == 0) {
            $week_number++;
        }
    }
    
    if (empty($session_dates)) {
        echo json_encode([
            'success' => false,
            'message' => 'No valid session dates found or all selected times conflict with existing sessions'
        ]);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    $created_sessions = 0;
    $session_ids = [];
    
    // Create each session
    foreach ($session_dates as $session_info) {
        $session_title = str_replace(
            ['{week}', '{date}'],
            [$session_info['week'], $session_info['date_str']],
            $title_template
        );
        
        $session_description = str_replace(
            ['{week}', '{date}'],
            [$session_info['week'], $session_info['date_str']],
            $description
        );
        
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
        $stmt->bindParam(':title', $session_title);
        $stmt->bindValue(':date_time', $session_info['datetime']->format('Y-m-d H:i:s'));
        $stmt->bindParam(':duration', $duration);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':meeting_link', $meeting_link);
        
        if ($stmt->execute()) {
            $created_sessions++;
            $session_ids[] = $db->lastInsertId();
        }
    }
    
    // Generate notifications for all students in this classroom
    if ($created_sessions > 0) {
        $notif_title = "Recurring Classes Scheduled";
        $notif_message = "{$created_sessions} new classes have been scheduled for " . $data['title'];
        $notificationService = new NotificationService();
        
        // Get all student IDs in the classroom
        $studentStmt = $db->prepare("SELECT student_id FROM classroom_students WHERE classroom_id = :classroom_id");
        $studentStmt->bindParam(':classroom_id', $data['classroom_id']);
        $studentStmt->execute();
        $studentIds = $studentStmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (!empty($studentIds)) {
            $notificationService->sendBulkCustom($studentIds, $notif_title, $notif_message, 'recurring_classes_scheduled');
        }
    }
    
    // Commit transaction
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "Successfully created {$created_sessions} recurring sessions",
        'sessions_created' => $created_sessions,
        'session_ids' => $session_ids
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    if ($db->inTransaction()) {
        $db->rollback();
    }
    
    echo json_encode([
        'success' => false,
        'message' => 'Error creating recurring sessions: ' . $e->getMessage()
    ]);
}
?>
