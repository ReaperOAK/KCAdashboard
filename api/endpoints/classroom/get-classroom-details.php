<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Classroom.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $classroom = new Classroom($db);

    // Get class_id from URL parameter
    $class_id = isset($_GET['id']) ? $_GET['id'] : die();
    
    // Get user_id from token (implement proper token validation)
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    $user_id = 1; // Temporary! Replace with actual user_id from token

    $classDetails = $classroom->getClassDetails($class_id, $user_id);

    if ($classDetails) {
        http_response_code(200);
        echo json_encode([
            "classroom" => $classDetails
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "message" => "Classroom not found"
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching classroom details",
        "error" => $e->getMessage()
    ]);
}
?>
