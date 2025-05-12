<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Analytics.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $analytics = new Analytics($db);

    $range = isset($_GET['range']) ? $_GET['range'] : 'month';
    
    $result = $analytics->getStats($range);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error fetching analytics data",
        "error" => $e->getMessage()
    ]);
}
?>
