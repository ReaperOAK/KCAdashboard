<?php
session_start();
require_once('../config.php');

function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function checkRole($allowedRoles) {
    if (!isset($_SESSION['role'])) {
        return false;
    }
    return in_array($_SESSION['role'], $allowedRoles);
}

function redirectBasedOnRole() {
    if (!isset($_SESSION['role'])) {
        header('Location: /login.php');
        exit();
    }

    switch ($_SESSION['role']) {
        case 'student':
            header('Location: /student/dashboard.php');
            break;
        case 'teacher':
            header('Location: /teacher/dashboard.php');
            break;
        case 'admin':
            header('Location: /admin/dashboard.php');
            break;
        default:
            header('Location: /unauthorized.php');
    }
    exit();
}

// Usage example for protected pages
function protectRoute($allowedRoles = []) {
    if (!isAuthenticated()) {
        header('Location: /login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
        exit();
    }

    if (!empty($allowedRoles) && !checkRole($allowedRoles)) {
        redirectBasedOnRole();
    }
}
?>
