
<?php
require_once '../../config/cors.php';
header('Content-Type: application/json');

require_once '../../middleware/auth.php';
require_once '../../config/Database.php';
require_once '../../models/Notification.php';
require_once '../../services/NotificationService.php';

$user_id = validateToken();
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Start transaction
        $db->beginTransaction();

        foreach ($data->attendance as $record) {
            $query = "INSERT INTO attendance 
                    (student_id, batch_id, session_id, status, marked_by, notes) 
                    VALUES (:student_id, :batch_id, :session_id, :status, :marked_by, :notes)
                    ON DUPLICATE KEY UPDATE 
                    status = :status, notes = :notes, marked_by = :marked_by";

            $stmt = $db->prepare($query);
            $stmt->execute([
                'student_id' => $record->student_id,
                'batch_id' => $record->batch_id,
                'session_id' => $record->session_id,
                'status' => $record->status,
                'marked_by' => $user_id,
                'notes' => $record->notes ?? null
            ]);
        }

        // Commit transaction
        $db->commit();

        // Send notifications
        sendAttendanceNotifications($data->attendance);

        echo json_encode(['success' => true, 'message' => 'Attendance marked successfully']);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function sendAttendanceNotifications($attendance) {
    $notificationService = new NotificationService();
    foreach ($attendance as $record) {
        if ($record->status === 'absent') {
            // Use NotificationService to send notification with proper category
            $title = 'Absence Recorded';
            $message = "You were marked absent for today's class.";
            $category = 'attendance';
            $notificationService->sendCustom($record->student_id, $title, $message, $category);
        }
    }
}
?>
