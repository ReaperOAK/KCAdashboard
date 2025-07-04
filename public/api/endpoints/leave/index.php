<?php
// endpoints/leave/index.php
// Route requests to the correct leave endpoint

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'request':
        require __DIR__ . '/request.php';
        break;
    case 'requests':
        require __DIR__ . '/requests.php';
        break;
    case 'approve':
        require __DIR__ . '/approve.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
}
