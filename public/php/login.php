<?php
session_start();
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    error_log("Invalid JSON input");
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$email = $data->email;
$password = $data->password;

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    error_log("Database query failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Database query failed']);
    exit;
}

$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    // Store user ID and role in session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['email'] = $user['email'];
    
    echo json_encode(['success' => true, 'role' => $user['role']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}

$stmt->close();
$conn->close();
?>