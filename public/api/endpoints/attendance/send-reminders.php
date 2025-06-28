
<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../utils/Mailer.php';

function sendAttendanceReminders() {
    $database = new Database();
    $db = $database->getConnection();

    // Get sessions starting in the next hour
    $query = "SELECT bs.*, b.name as batch_name, 
              GROUP_CONCAT(DISTINCT u.email) as student_emails,
              GROUP_CONCAT(DISTINCT u.full_name) as student_names
              FROM batch_sessions bs
              JOIN batches b ON bs.batch_id = b.id
              JOIN batch_students bs_stu ON b.id = bs_stu.batch_id
              JOIN users u ON bs_stu.student_id = u.id
              WHERE bs.date_time BETWEEN NOW() 
              AND DATE_ADD(NOW(), INTERVAL 1 HOUR)
              AND bs.reminder_sent = 0
              GROUP BY bs.id";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($sessions as $session) {
        $emails = explode(',', $session['student_emails']);
        $names = explode(',', $session['student_names']);

        foreach ($emails as $index => $email) {
            $mailer = new Mailer();
            $mailer->sendAttendanceReminder([
                'email' => $email,
                'name' => $names[$index],
                'batch_name' => $session['batch_name'],
                'session_time' => $session['date_time'],
                'meeting_link' => $session['meeting_link']
            ]);
        }

        // Mark reminder as sent
        $updateQuery = "UPDATE batch_sessions 
                       SET reminder_sent = 1 
                       WHERE id = :session_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->execute(['session_id' => $session['id']]);
    }

    return count($sessions);
}

// This endpoint can be called by a cron job
if (php_sapi_name() == 'cli' || isset($_GET['run_reminders'])) {
    $remindersSent = sendAttendanceReminders();
    echo json_encode([
        'success' => true,
        'reminders_sent' => $remindersSent
    ]);
}
?>
