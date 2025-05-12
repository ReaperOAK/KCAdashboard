<?php
header('Content-Type: application/json');
require_once '../middleware/auth.php';
require_once '../config/Database.php';

$user_id = validateToken();
$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"));
        
        switch($data->platform) {
            case 'zoom':
                syncZoomAttendance($data->meeting_id, $data->batch_id);
                break;
            case 'google_meet':
                syncGoogleMeetAttendance($data->meeting_id, $data->batch_id);
                break;
            default:
                throw new Exception('Unsupported platform');
        }

        echo json_encode(['success' => true, 'message' => 'Attendance synced successfully']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function syncZoomAttendance($meeting_id, $batch_id) {
    // Implementation for Zoom API integration
    $zoom_api = new ZoomAPI(getenv('ZOOM_API_KEY'), getenv('ZOOM_API_SECRET'));
    $participants = $zoom_api->getMeetingParticipants($meeting_id);
    
    markOnlineAttendance($participants, $batch_id);
}

function syncGoogleMeetAttendance($meeting_id, $batch_id) {
    // Implementation for Google Meet API integration
    $google_api = new GoogleMeetAPI(getenv('GOOGLE_API_KEY'));
    $participants = $google_api->getMeetingParticipants($meeting_id);
    
    markOnlineAttendance($participants, $batch_id);
}

function markOnlineAttendance($participants, $batch_id) {
    global $db;
    
    // Get current session
    $query = "SELECT id FROM batch_sessions 
              WHERE batch_id = :batch_id 
              AND date_time::date = CURRENT_DATE";
    $stmt = $db->prepare($query);
    $stmt->execute(['batch_id' => $batch_id]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$session) {
        throw new Exception('No session found for today');
    }
    
    // Mark attendance for each participant
    foreach ($participants as $participant) {
        $query = "INSERT INTO attendance 
                (student_id, batch_id, session_id, status, marked_by, notes) 
                VALUES (:student_id, :batch_id, :session_id, 'present', :marked_by, 'Marked via online platform')
                ON DUPLICATE KEY UPDATE status = 'present'";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            'student_id' => $participant->user_id,
            'batch_id' => $batch_id,
            'session_id' => $session['id'],
            'marked_by' => 'SYSTEM'
        ]);
    }
}
?>
