<?php
$host = 'localhost';
$db   = 'u703958259_dashboard';
$user = 'u703958259_admin';
$pass = '1!jqkNyFs';

// Create a new MySQLi connection
$conn = new mysqli($host, $user, $pass, $db);

// Check for connection errors
if ($conn->connect_error) {
    error_log("Connection failed: " . $conn->connect_error);
    die("Connection failed: " . $conn->connect_error);
}

// Set the charset to utf8mb4 for better security and compatibility
if (!$conn->set_charset("utf8mb4")) {
    error_log("Error loading character set utf8mb4: " . $conn->error);
    die("Error loading character set utf8mb4: " . $conn->error);
}
session_start([
    'cookie_lifetime' => 86400, // 1 day
    'cookie_secure' => true,
    'cookie_httponly' => true,
    'use_strict_mode' => true,
    'use_cookies' => true,
    'use_only_cookies' => true,
]);
phpinfo();
?>