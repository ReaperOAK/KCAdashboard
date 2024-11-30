<?php
session_start();

if (isset($_SESSION['user_id']) && isset($_SESSION['role'])) {
    echo json_encode(['success' => true, 'role' => $_SESSION['role']]);
} else {
    error_log("Session validation failed: Session invalid or expired");
    echo json_encode(['success' => false, 'message' => 'Session invalid or expired']);
}
?>