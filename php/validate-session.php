<?php
// Set the session save path
ini_set('session.save_path', '/opt/alt/php82/var/lib/php/session');

// Start the session
session_start();

// Check if user_id and role are set in the session
if (isset($_SESSION['user_id']) && isset($_SESSION['role'])) {
    // Return success response with user role
    echo json_encode(['success' => true, 'role' => $_SESSION['role']]);
} else {
    // Log error and return failure response
    error_log("Session validation failed: Session invalid or expired");
    echo json_encode(['success' => false, 'message' => 'Session invalid or expired']);
}
?>