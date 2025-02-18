<?php
// This file should be included at the start of each endpoint
define('ROOT_PATH', realpath($_SERVER['DOCUMENT_ROOT'] . '/dashboard/api'));
define('CONFIG_PATH', ROOT_PATH . '/config');
define('MODEL_PATH', ROOT_PATH . '/models');
define('MIDDLEWARE_PATH', ROOT_PATH . '/middleware');

// Set include path
set_include_path(get_include_path() . PATH_SEPARATOR . ROOT_PATH);

// Error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Function to handle autoloading
spl_autoload_register(function ($class) {
    $paths = array(
        ROOT_PATH . '/models/',
        ROOT_PATH . '/config/',
        ROOT_PATH . '/middleware/'
    );
    
    foreach ($paths as $path) {
        $file = $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Load configuration
require_once CONFIG_PATH . '/cors.php';
require_once CONFIG_PATH . '/database.php';

// Debug information
error_log("Bootstrap loaded");
error_log("ROOT_PATH: " . ROOT_PATH);
error_log("Include path: " . get_include_path());
?>
