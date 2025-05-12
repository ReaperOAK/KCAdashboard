<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/Classroom.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    // Get class_id from URL parameter
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('Classroom ID is required');
    }
    
    $class_id = $_GET['id'];
    
    $database = new Database();
    $db = $database->getConnection();
    $classroom = new Classroom($db);

    $classDetails = $classroom->getClassDetails($class_id, $user['id']);

    if ($classDetails) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "classroom" => $classDetails
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Classroom not found or you don't have access to it"
        ]);
    }

} catch (Exception $e) {
    error_log("Error in get-classroom-details: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error fetching classroom details",
        "error" => $e->getMessage()
    ]);
}
?>
