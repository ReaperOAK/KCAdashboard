<?php
// Include the database configuration file
include 'config.php';

// Start the session
session_start();

// Decode the JSON input
$data = json_decode(file_get_contents("php://input"));

// Check if the input is valid
if (!$data) {
    error_log("Invalid JSON input");
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

// Extract email and password from the input
$email = $data->email;
$password = $data->password;

// Prepare the SQL statement to fetch the user
$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if the query was successful
if (!$result) {
    error_log("Database query failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Database query failed']);
    exit;
}

// Fetch the user data
$user = $result->fetch_assoc();

// Debug: Check if user data is fetched correctly
if (!$user) {
    error_log("User not found: " . $email);
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    exit;
}

// Verify the password and set a cookie with user data
if (password_verify($password, $user['password'])) {
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];

    // Set a cookie with user ID and role
    setcookie('user_id', $user['id'], time() + 86400, '/', '', false, true); // 1 day expiration
    setcookie('role', $user['role'], time() + 86400, '/', '', false, true); // 1 day expiration

    echo json_encode(['success' => true, 'role' => $user['role']]);
} else {
    error_log("Password verification failed for user: " . $email);
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}

// Close the statement and the connection
$stmt->close();
$conn->close();
?>