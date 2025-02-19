<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Batch.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $batch = new Batch($db);

    // Get batches with active status
    $result = $batch->getAllBatches();

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "success",
        "batches" => $result
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error",
        "message" => "Error fetching batches",
        "error" => $e->getMessage()
    ]);
}
?>
