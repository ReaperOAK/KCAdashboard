<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once 'send_verification.php';
require_once '../../models/EmailVerification.php';

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

    if (empty($data->email) || empty($data->password)) {
        throw new Exception('Missing required fields: email or password');
    }

    // Force all new registrations to be students for security
    // Only admins can promote users to teacher role later
    // This prevents unauthorized access to teacher dashboards
    $forced_role = 'student';

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
    $user->role = $forced_role; // Always student for new registrations
    $user->full_name = $data->full_name ?? '';
    $user->google_id = $data->google_id ?? null;
    $user->profile_picture = $data->profile_picture ?? null;


    if ($user->create()) {
        // Generate and store verification token
        $verify_token = bin2hex(random_bytes(32));
        $expires_at = date('Y-m-d H:i:s', strtotime('+1 day'));
        $user_id = $db->lastInsertId();
        $ev = new EmailVerification($db);
        $ev->create($user_id, $verify_token, $expires_at);
        send_verification_email($user->email, $verify_token);
        http_response_code(201);
        echo json_encode(["message" => "User created successfully. Please check your email to verify your account."]);
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
