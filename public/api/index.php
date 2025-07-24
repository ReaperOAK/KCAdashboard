<?php
// Configure error reporting for production
error_reporting(E_ERROR | E_PARSE); // Only show fatal errors
ini_set('display_errors', '0'); // Don't display errors to browser

date_default_timezone_set('Asia/Kolkata');

// Start output buffering to capture any unwanted output
ob_start();

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
    // Clear any unwanted output before sending JSON
    $unwanted_output = ob_get_clean();
    if (!empty($unwanted_output)) {
        error_log("Unwanted output detected: " . $unwanted_output);
    }
    
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint not found',
        'path' => $path,
        'file' => $filePath
    ]);
}

// Clean up any remaining output buffer
if (ob_get_level()) {
    $unwanted_output = ob_get_clean();
    if (!empty($unwanted_output)) {
        error_log("Unwanted output at end: " . $unwanted_output);
    }
}
?>
