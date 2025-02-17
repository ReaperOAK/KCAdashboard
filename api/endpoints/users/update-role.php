<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->role)) {
        throw new Exception("Missing required fields");
    }

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    if (!in_array($data->role, ['student', 'teacher', 'admin'])) {
        throw new Exception("Invalid role specified");
    }

    $result = $user->updateRole($data->user_id, $data->role);

    if ($result) {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode(["message" => "User role updated successfully"]);
    } else {
        throw new Exception("Failed to update user role");
    }

} catch (Exception $e) {
    error_log("Error in update-role.php: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error updating user role",
        "error" => $e->getMessage()
    ]);
}
?>
