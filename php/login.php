<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

$email = $data->email;
$password = $data->password;

$sql = "SELECT * FROM users WHERE email = '$email'";
$result = mysqli_query($conn, $sql);
$user = mysqli_fetch_assoc($result);

if ($user && password_verify($password, $user['password'])) {
    $payload = json_encode(['role' => $user['role'], 'email' => $user['email']]);
    $token = base64_encode($payload); // Simple encoding for demonstration
    setcookie('token', $token, time() + (86400 * 30), "/"); // Set cookie for 30 days
    echo json_encode(['success' => true, 'token' => $token, 'role' => $user['role']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}

mysqli_close($conn);
?>