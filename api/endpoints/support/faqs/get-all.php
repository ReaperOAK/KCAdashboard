<?php
require_once '../../../config/cors.php';
require_once '../../../config/Database.php';
require_once '../../../models/Support.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    $faqs = $support->getAllFaqs();

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "success",
        "faqs" => $faqs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "status" => "error",
        "message" => "Error fetching FAQs",
        "error" => $e->getMessage()
    ]);
}
?>
