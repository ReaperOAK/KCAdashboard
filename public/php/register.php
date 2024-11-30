<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    error_log("Invalid JSON input");
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$name = $data->name;
$email = $data->email;
$password = password_hash($data->password, PASSWORD_DEFAULT);
$role = $data->role;

// SQL query to insert data into users table using prepared statements
$sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $name, $email, $password, $role);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registration successful!']);
} else {
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>