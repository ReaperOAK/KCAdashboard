<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Tournament.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $tournament = new Tournament($db);

    $status = isset($_GET['status']) ? $_GET['status'] : die();
    $tournaments = $tournament->getByStatus($status);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "tournaments" => $tournaments
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error fetching tournaments by status",
        "error" => $e->getMessage()
    ]);
}
?>
