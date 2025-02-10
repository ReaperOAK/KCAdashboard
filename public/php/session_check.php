<?php
function checkSession() {
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        return false;
    }

    // Check session timeout (30 minutes)
    $timeout = 1800; // 30 minutes in seconds
    if (isset($_SESSION['last_activity']) && 
        (time() - $_SESSION['last_activity']) > $timeout) {
        session_destroy();
        return false;
    }

    // Update last activity time
    $_SESSION['last_activity'] = time();
    return true;
}

function requireLogin() {
    if (!checkSession()) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Session expired or invalid'
        ]);
        exit;
    }
}

function getUserRole() {
    return isset($_SESSION['user_role']) ? $_SESSION['user_role'] : null;
}

function checkPermission($allowedRoles) {
    $userRole = getUserRole();
    return in_array($userRole, $allowedRoles);
}
?>
