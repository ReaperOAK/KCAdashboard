<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->email) && !empty($data->password) && !empty($data->role)) {
        // Check if email already exists
        if($user->emailExists($data->email)) {
            http_response_code(400);
            echo json_encode(["message" => "Email already exists"]);
            exit;
        }

        $user->email = $data->email;
        $user->password = password_hash($data->password, PASSWORD_DEFAULT); // Hash the password
        $user->role = $data->role;
        $user->full_name = $data->full_name;
        $user->google_id = $data->google_id ?? null;
        $user->profile_picture = $data->profile_picture ?? null;

        if($user->create()) {
            http_response_code(201);
            echo json_encode(["message" => "User created successfully"]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create user"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Unable to create user. Data is incomplete"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Server error",
        "error" => $e->getMessage()
    ]);
}
?>
