<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password) && !empty($data->role)) {
    $user->email = $data->email;
    $user->password = $data->password;
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
?>
