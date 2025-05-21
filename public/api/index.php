<?php
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/middleware/auth.php';

// Get the request path
$request = $_SERVER['REQUEST_URI'];
$prefix = '/api/endpoints/';
$path = '';

if (strpos($request, $prefix) === 0) {
    $path = substr($request, strlen($prefix));
}

// Clean the path
$path = trim($path, '/');
$filePath = __DIR__ . '/endpoints/' . $path . '.php';

// Route the request
if (file_exists($filePath)) {
    require_once $filePath;
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint not found',
        'path' => $path,
        'file' => $filePath
    ]);
}
?>
