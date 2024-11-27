<?php
$host = 'localhost';
$db   = 'u703958259_dashboard';
$user = 'u703958259_admin';
$pass = '1!jqkNyFs';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
