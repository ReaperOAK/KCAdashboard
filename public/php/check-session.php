<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['user_id']) && isset($_SESSION['role'])) {
    echo json_encode([
        'success' => true,
        'role' => $_SESSION['role'],
        'user_id' => $_SESSION['user_id'],
        'name' => $_SESSION['name']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in'
    ]);
}
