<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';
require_once '../models/Simul.php';

try {
    // Authenticate user
    $user = verifyToken();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    $database = new Database();
    $db = $database->getConnection();
    
    $simul = new Simul($db);
    $simuls = $simul->getUpcoming();
    
    echo json_encode(array(
        "success" => true,
        "message" => "Successfully retrieved upcoming simul events",
        "simuls" => $simuls
    ));
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => $e->getMessage()
    ));
}
?>
