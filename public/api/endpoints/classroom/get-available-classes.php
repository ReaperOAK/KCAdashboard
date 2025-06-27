<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/Classroom.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    // Only students can browse available classes
    if ($user['role'] !== 'student') {
        throw new Exception('Only students can browse available classes');
    }

    $database = new Database();
    $db = $database->getConnection();
    $classroom = new Classroom($db);

    // Get available classes for the authenticated student
    $classes = $classroom->getAvailableClasses($user['id']);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "classes" => $classes
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Error fetching available classes",
        "error" => $e->getMessage()
    ]);
}
?>
