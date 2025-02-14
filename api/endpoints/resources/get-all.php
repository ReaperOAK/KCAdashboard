<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Resource.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $resource = new Resource($db);

    $resources = $resource->getAll();

    http_response_code(200);
    echo json_encode([
        "resources" => $resources
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching resources",
        "error" => $e->getMessage()
    ]);
}
?>
