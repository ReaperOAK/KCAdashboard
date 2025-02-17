<?php
require_once '../../../config/cors.php';
require_once '../../../config/Database.php';
require_once '../../../models/Support.php';

try {
    if (!isset($_GET['id'])) {
        throw new Exception('FAQ ID is required');
    }

    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    if ($support->deleteFaq($_GET['id'])) {
        http_response_code(200);
        echo json_encode(["message" => "FAQ deleted successfully"]);
    } else {
        throw new Exception('Failed to delete FAQ');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error deleting FAQ",
        "error" => $e->getMessage()
    ]);
}
?>
