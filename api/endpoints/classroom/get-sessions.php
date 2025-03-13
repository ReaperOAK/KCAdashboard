<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';

// Verify token and get user
$user_data = verifyToken();

if (!$user_data) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Get the classroom ID from query params
$classroom_id = isset($_GET['classroom_id']) ? intval($_GET['classroom_id']) : null;
$start_date = isset($_GET['start']) ? $_GET['start'] : date('Y-m-d', strtotime('-30 days'));
$end_date = isset($_GET['end']) ? $_GET['end'] : date('Y-m-d', strtotime('+60 days'));

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $query = "";
    $params = [];
    
    if ($user_data['role'] === 'teacher') {
        // For teachers: Get sessions for all classrooms they teach, or for a specific classroom
        if ($classroom_id) {
            $query = "
                SELECT 
                    bs.id, 
                    bs.title, 
                    bs.date_time, 
                    bs.duration, 
                    bs.type,
                    bs.meeting_link,
                    c.name as classroom_name,
                    bs.batch_id as classroom_id
                FROM batch_sessions bs
                JOIN classrooms c ON bs.batch_id = c.id
                WHERE c.teacher_id = :teacher_id
                  AND bs.batch_id = :classroom_id
                  AND bs.date_time BETWEEN :start_date AND :end_date
                ORDER BY bs.date_time ASC
            ";
            $params = [
                ':teacher_id' => $user_data['id'],
                ':classroom_id' => $classroom_id,
                ':start_date' => $start_date,
                ':end_date' => $end_date
            ];
        } else {
            $query = "
                SELECT 
                    bs.id, 
                    bs.title, 
                    bs.date_time, 
                    bs.duration, 
                    bs.type,
                    bs.meeting_link,
                    c.name as classroom_name,
                    bs.batch_id as classroom_id
                FROM batch_sessions bs
                JOIN classrooms c ON bs.batch_id = c.id
                WHERE c.teacher_id = :teacher_id
                  AND bs.date_time BETWEEN :start_date AND :end_date
                ORDER BY bs.date_time ASC
            ";
            $params = [
                ':teacher_id' => $user_data['id'],
                ':start_date' => $start_date,
                ':end_date' => $end_date
            ];
        }
    } else if ($user_data['role'] === 'student') {
        // For students: Get sessions for classrooms they're enrolled in
        if ($classroom_id) {
            $query = "
                SELECT 
                    bs.id, 
                    bs.title, 
                    bs.date_time, 
                    bs.duration, 
                    bs.type,
                    bs.meeting_link,
                    c.name as classroom_name,
                    bs.batch_id as classroom_id
                FROM batch_sessions bs
                JOIN classrooms c ON bs.batch_id = c.id
                JOIN classroom_students cs ON c.id = cs.classroom_id
                WHERE cs.student_id = :student_id
                  AND bs.batch_id = :classroom_id
                  AND bs.date_time BETWEEN :start_date AND :end_date
                ORDER BY bs.date_time ASC
            ";
            $params = [
                ':student_id' => $user_data['id'],
                ':classroom_id' => $classroom_id,
                ':start_date' => $start_date,
                ':end_date' => $end_date
            ];
        } else {
            $query = "
                SELECT 
                    bs.id, 
                    bs.title, 
                    bs.date_time, 
                    bs.duration, 
                    bs.type,
                    bs.meeting_link,
                    c.name as classroom_name,
                    bs.batch_id as classroom_id
                FROM batch_sessions bs
                JOIN classrooms c ON bs.batch_id = c.id
                JOIN classroom_students cs ON c.id = cs.classroom_id
                WHERE cs.student_id = :student_id
                  AND bs.date_time BETWEEN :start_date AND :end_date
                ORDER BY bs.date_time ASC
            ";
            $params = [
                ':student_id' => $user_data['id'],
                ':start_date' => $start_date,
                ':end_date' => $end_date
            ];
        }
    } else if ($user_data['role'] === 'admin') {
        // For admins: Get all sessions or by classroom
        if ($classroom_id) {
            $query = "
                SELECT 
                    bs.id, 
                    bs.title, 
                    bs.date_time, 
                    bs.duration, 
                    bs.type,
                    bs.meeting_link,
                    c.name as classroom_name,
                    bs.batch_id as classroom_id
                FROM batch_sessions bs
                JOIN classrooms c ON bs.batch_id = c.id
                WHERE bs.batch_id = :classroom_id
                  AND bs.date_time BETWEEN :start_date AND :end_date
                ORDER BY bs.date_time ASC
            ";
            $params = [
                ':classroom_id' => $classroom_id,
                ':start_date' => $start_date,
                ':end_date' => $end_date
            ];
        } else {
            $query = "
                SELECT 
                    bs.id, 
                    bs.title, 
                    bs.date_time, 
                    bs.duration, 
                    bs.type,
                    bs.meeting_link,
                    c.name as classroom_name,
                    bs.batch_id as classroom_id
                FROM batch_sessions bs
                JOIN classrooms c ON bs.batch_id = c.id
                WHERE bs.date_time BETWEEN :start_date AND :end_date
                ORDER BY bs.date_time ASC
            ";
            $params = [
                ':start_date' => $start_date,
                ':end_date' => $end_date
            ];
        }
    }
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format sessions for calendar
    $calendar_events = [];
    foreach ($sessions as $session) {
        $start_time = new DateTime($session['date_time']);
        $end_time = clone $start_time;
        $end_time->add(new DateInterval('PT' . $session['duration'] . 'M')); // Add duration in minutes
        
        $color = $session['type'] === 'online' ? '#461fa3' : '#7646eb';
        
        $calendar_events[] = [
            'id' => $session['id'],
            'title' => $session['title'],
            'start' => $start_time->format('c'),
            'end' => $end_time->format('c'),
            'classroomName' => $session['classroom_name'],
            'classroomId' => $session['classroom_id'],
            'type' => $session['type'],
            'meetingLink' => $session['meeting_link'],
            'color' => $color,
            'textColor' => '#ffffff'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'events' => $calendar_events
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching sessions: ' . $e->getMessage()
    ]);
}
?>
