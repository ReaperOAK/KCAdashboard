<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // Get filter and search parameters
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    $users = $user->getAll($filter, $search);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "users" => $users
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error fetching users",
        "error" => $e->getMessage()
    ]);
}
?>
