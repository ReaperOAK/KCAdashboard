<?php
require_once '../../../config/cors.php';
require_once '../../../config/Database.php';
require_once '../../../models/Support.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    $tickets = $support->getAllTickets();

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "success",
        "tickets" => $tickets
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error",
        "message" => "Error fetching tickets",
        "error" => $e->getMessage()
    ]);
}
?>
