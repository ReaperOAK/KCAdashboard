<?php
require_once('../../php/config.php');
require_once('../../php/auth/middleware.php');

session_start();

$protection = new RouteProtection($conn);
$protection->requireRole(['student', 'teacher']);

// If execution reaches here, the user is authenticated and authorized
$userId = $_SESSION['user_id'];

// Your API logic here
?>
