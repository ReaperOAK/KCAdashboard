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

    // Get user_id from token (implement proper token validation)
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    
    $users = $user->getAllUsers($filter, $search);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "users" => $users
    ]);

} catch (Exception $e) {
    error_log("Error in get-all.php: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error fetching users",
        "error" => $e->getMessage()
    ]);
}
?>
