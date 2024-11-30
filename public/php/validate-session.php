<?php
session_start();

if (isset($_SESSION['user_id']) && isset($_SESSION['role'])) {
    echo json_encode(['success' => true, 'role' => $_SESSION['role']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Session invalid']);
}
?>