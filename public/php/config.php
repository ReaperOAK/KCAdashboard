<?php
$host = 'localhost';
$db   = 'u703958259_dashboard';
$user = 'u703958259_admin';
$pass = '1!jqkNyFs';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}

// Set the charset to utf8mb4 for better security and compatibility
if (!$conn->set_charset("utf8mb4")) {
    error_log("Error loading character set utf8mb4: " . $conn->error);
    die("Error loading character set utf8mb4: " . $conn->error);
}
?>