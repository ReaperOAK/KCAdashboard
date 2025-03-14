<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Classroom.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $classroom = new Classroom($db);

    // Get classroom ID from request
    $id = isset($_GET['id']) ? $_GET['id'] : die(json_encode(["message" => "Classroom ID not provided"]));
    
    // Get classroom details
    $classroomDetails = $classroom->getClassroomDetails($id);
    
    if (!$classroomDetails) {
        http_response_code(404);
        echo json_encode(["message" => "Classroom not found"]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        "classroom" => $classroomDetails
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching classroom details",
        "error" => $e->getMessage()
    ]);
}
?>
