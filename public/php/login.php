<?php
include 'config.php';
require 'vendor/autoload.php'; // Include the JWT library
use \Firebase\JWT\JWT;

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    error_log("Invalid JSON input");
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$email = $data->email;
$password = $data->password;

$sql = "SELECT * FROM users WHERE email = '$email'";
$result = mysqli_query($conn, $sql);

if (!$result) {
    error_log("Database query failed: " . mysqli_error($conn));
    echo json_encode(['success' => false, 'message' => 'Database query failed']);
    exit;
}

$user = mysqli_fetch_assoc($result);

if ($user && password_verify($password, $user['password'])) {
    $secret_key = "your_secret_key"; // Replace with your actual secret key
    $payload = [
        'id' => $user['id'],
        'role' => $user['role'],
        'email' => $user['email']
    ];
    $token = JWT::encode($payload, $secret_key);
    setcookie('token', $token, time() + (86400 * 30), "/"); // Set cookie for 30 days
    echo json_encode(['success' => true, 'token' => $token, 'role' => $user['role']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}

mysqli_close($conn);
?>