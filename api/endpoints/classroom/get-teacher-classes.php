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
    // Validate token and get user ID
    $teacher_id = validateToken();
    $teacher = getAuthUser();

    // Make sure we have a valid teacher role
    if (!$teacher || $teacher['role'] !== 'teacher') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized access. Only teachers can view classes."
        ]);
        exit;
    }

    $database = new Database();
    $db = $database->getConnection();
    
    // Use the Classroom model to get classes
    $classroom = new Classroom($db);
    $classes = $classroom->getTeacherClasses($teacher_id);
    
    // Log for debugging purposes
    error_log("Teacher ID: " . $teacher_id . " | Classes found: " . count($classes));
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "classes" => $classes
    ]);

} catch (Exception $e) {
    error_log("Error in get-teacher-classes.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error fetching classes",
        "error" => $e->getMessage()
    ]);
}
?>
