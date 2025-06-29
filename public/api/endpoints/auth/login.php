<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    
    $user = new User($db);
    $data = json_decode(file_get_contents("php://input"));

    error_log("Login attempt for email: " . $data->email);

    if(!empty($data->email) && !empty($data->password)) {
        $userData = $user->findByEmail($data->email);
        if($userData) {
            // Check user status
            if (!isset($userData['status']) || $userData['status'] !== 'active') {
                error_log("Login blocked: user status is not active");
                http_response_code(403);
                echo json_encode(["message" => "Account is not active. Please contact support."]);
                exit();
            }
            error_log("User found, verifying password");
            if(password_verify($data->password, $userData['password'])) {
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
                error_log("Password verification failed");
                http_response_code(401);
                echo json_encode(["message" => "Invalid credentials"]);
            }
        } else {
            error_log("User not found");
            http_response_code(401);
            echo json_encode(["message" => "Invalid credentials"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields"]);
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Login failed",
        "error" => $e->getMessage()
    ]);
}
?>
