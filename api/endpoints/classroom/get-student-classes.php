<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Classroom.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $classroom = new Classroom($db);

    // Get user_id from token (implement proper token validation)
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    $user_id = 1; // Temporary! Replace with actual user_id from token

    $classes = $classroom->getStudentClasses($user_id);

    http_response_code(200);
    echo json_encode([
        "classes" => $classes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching classes",
        "error" => $e->getMessage()
    ]);
}
?>
