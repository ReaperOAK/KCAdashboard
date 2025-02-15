<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/PGN.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $pgn = new PGN($db);

    // Get teacher_id from token (implement proper token validation)
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    $teacher_id = 1; // Temporary! Replace with actual teacher_id from token

    $pgns = $pgn->getTeacherPGNs($teacher_id);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "pgns" => $pgns
    ]);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error fetching PGNs",
        "error" => $e->getMessage()
    ]);
}
?>
