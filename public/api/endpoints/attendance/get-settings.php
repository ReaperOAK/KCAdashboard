<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();


    $query = "SELECT id, min_attendance_percent, late_threshold_minutes, auto_mark_absent_after_minutes, reminder_before_minutes, created_at, updated_at FROM attendance_settings ORDER BY id DESC LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    // Provide defaults if no settings exist
    if (!$settings) {
        $settings = [
            'min_attendance_percent' => 75,
            'late_threshold_minutes' => 15,
            'auto_mark_absent_after_minutes' => 30,
            'reminder_before_minutes' => 60,
            'created_at' => null,
            'updated_at' => null
        ];
    }

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'settings' => $settings
    ]);
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Error fetching attendance settings',
        'message' => $e->getMessage()
    ]);
}
?>
