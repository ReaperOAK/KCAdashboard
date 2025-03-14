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
    
    // Check if request is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->simul_id)) {
        throw new Exception('Simul ID is required');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    $simul = new Simul($db);
    $result = $simul->registerUser($data->simul_id, $user['id']);
    
    if ($result === "success") {
        echo json_encode(array(
            "success" => true,
            "message" => "Successfully registered for simul event"
        ));
    } else if ($result === "already_registered") {
        echo json_encode(array(
            "success" => false,
            "message" => "You are already registered for this simul event"
        ));
    } else {
        throw new Exception('Failed to register for simul event');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => $e->getMessage()
    ));
}
?>
