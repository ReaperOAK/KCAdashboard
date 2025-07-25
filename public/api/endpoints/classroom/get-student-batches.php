<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/Classroom.php';

try {
    // Properly validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    $database = new Database();
    $db = $database->getConnection();
    $classroom = new Classroom($db);

    // Get batches for the authenticated student (use the new method)
    $classes = $classroom->getStudentBatches($user['id']);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "classes" => $classes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error fetching classes",
        "error" => $e->getMessage()
    ]);
}
?>
