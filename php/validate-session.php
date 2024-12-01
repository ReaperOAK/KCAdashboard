<?php
// Check if user_id and role are set in the cookies
if (isset($_COOKIE['user_id']) && isset($_COOKIE['role'])) {
    // Return success response with user role
    echo json_encode(['success' => true, 'role' => $_COOKIE['role']]);
} else {
    // Log error and return failure response
    error_log("Cookie validation failed: Cookie invalid or expired");
    echo json_encode(['success' => false, 'message' => 'Cookie invalid or expired']);
}
?>