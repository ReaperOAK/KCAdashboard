<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $userData = $user->findByEmail($data->email);
    
    if($userData && password_verify($data->password, $userData['password'])) {
        $user->id = $userData['id'];
        $token = $user->generateAuthToken();
        
        http_response_code(200);
        echo json_encode([
            "token" => $token,
            "user" => [
                "id" => $userData['id'],
                "email" => $userData['email'],
                "role" => $userData['role'],
                "full_name" => $userData['full_name'],
                "profile_picture" => $userData['profile_picture']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Invalid credentials"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields"]);
}
?>
