<?php
require_once '../../config.php';
header('Content-Type: application/json');

session_start();

$dashboard_type = $_GET['type'] ?? '';

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$allowed_access = false;
$role = $_SESSION['role'];

switch ($dashboard_type) {
    case 'student':
        $allowed_access = ($role === 'student');
        break;
    case 'teacher':
        $allowed_access = ($role === 'teacher');
        break;
    case 'admin':
        $allowed_access = ($role === 'admin');
        break;
}

if (!$allowed_access) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

echo json_encode(['success' => true, 'role' => $role]);
