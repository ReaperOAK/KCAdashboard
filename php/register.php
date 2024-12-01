<?php
// Include the database configuration file
include 'config.php';

// Decode the JSON input data
$data = json_decode(file_get_contents("php://input"));

// Check if the input data is valid
if (!$data) {
    error_log("Invalid JSON input");
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

// Extract data from the input
$name = $data->name;
$email = $data->email;
$password = password_hash($data->password, PASSWORD_DEFAULT);
$role = $data->role;

// SQL query to insert data into users table using prepared statements
$sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $name, $email, $password, $role);

// Execute the query and check for success
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registration successful!']);
} else {
    error_log("Database query failed: " . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
}

// Close the statement and the database connection
$stmt->close();
$conn->close();
?>