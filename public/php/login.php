<?php
// Start the session
session_start();

// Include the database configuration file
include 'config.php';

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

// Verify the password and store user data in the session
if ($user && password_verify($password, $user['password'])) {
    // Store user ID and role in session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['email'] = $user['email'];
    
    echo json_encode(['success' => true, 'role' => $user['role']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}

// Close the statement and the connection
$stmt->close();
$conn->close();
?>