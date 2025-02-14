<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

try {
    // Log incoming request data
    $raw_data = file_get_contents("php://input");
    error_log("Received registration data: " . $raw_data);
    
    $data = json_decode($raw_data);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $user = new User($db);

    if (empty($data->email) || empty($data->password) || empty($data->role)) {
        throw new Exception('Missing required fields: email, password, or role');
    }

    // Validate email format
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Check if email exists
    if ($user->emailExists($data->email)) {
        http_response_code(400);
        echo json_encode(["message" => "Email already exists"]);
        exit;
    }

    $user->email = $data->email;
    $user->password = password_hash($data->password, PASSWORD_DEFAULT);
    $user->role = $data->role;
    $user->full_name = $data->full_name ?? '';
    $user->google_id = $data->google_id ?? null;
    $user->profile_picture = $data->profile_picture ?? null;

    if ($user->create()) {
        http_response_code(201);
        echo json_encode(["message" => "User created successfully"]);
    } else {
        throw new Exception('Failed to create user record');
    }

} catch (Exception $e) {
    error_log("Registration error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Registration failed",
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]);
}
?>
