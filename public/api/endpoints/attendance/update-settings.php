
<?php
require_once '../../config/cors.php';
header('Content-Type: application/json');
require_once '../../middleware/auth.php';
require_once '../../config/Database.php';

$user_id = validateToken();
$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"));

        // Validate required fields
        if (!isset($data->minAttendancePercent) || 
            !isset($data->lateThreshold) || 
            !isset($data->autoMarkAbsent) || 
            !isset($data->reminderBefore)) {
            throw new Exception('Missing required fields');
        }

        // Update or insert settings
        $query = "INSERT INTO attendance_settings 
                    (min_attendance_percent, late_threshold_minutes, 
                     auto_mark_absent_after_minutes, reminder_before_minutes) 
                 VALUES (:min_percent, :late_threshold, :auto_mark, :reminder)
                 ON DUPLICATE KEY UPDATE 
                    min_attendance_percent = :min_percent,
                    late_threshold_minutes = :late_threshold,
                    auto_mark_absent_after_minutes = :auto_mark,
                    reminder_before_minutes = :reminder";

        $stmt = $db->prepare($query);
        $stmt->execute([
            'min_percent' => $data->minAttendancePercent,
            'late_threshold' => $data->lateThreshold,
            'auto_mark' => $data->autoMarkAbsent,
            'reminder' => $data->reminderBefore
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>
