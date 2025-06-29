<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Attendance.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $attendance = new Attendance($db);

    // Get batch filter from query params
    $batch_id = isset($_GET['batch']) && $_GET['batch'] !== 'all' ? $_GET['batch'] : null;


    $result = $attendance->getAttendanceData($batch_id);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "success",
        "attendance_data" => $result['attendance_data'],
        "settings" => $result['settings']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error",
        "message" => "Error fetching attendance data",
        "error" => $e->getMessage()
    ]);
}
?>
