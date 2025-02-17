<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->user_id)) {
        throw new Exception("Missing user ID");
    }

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $userData = [
        'id' => $data->user_id,
        'full_name' => $data->full_name ?? '',
        'email' => $data->email ?? '',
        'role' => $data->role ?? '',
        'status' => $data->status ?? ''
    ];

    if ($user->updateUser($userData)) {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode(["message" => "User updated successfully"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error updating user",
        "error" => $e->getMessage()
    ]);
}
?>
