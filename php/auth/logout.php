<?php
header('Content-Type: application/json');
session_start();

// Clear session data
session_unset();
session_destroy();

echo json_encode(['success' => true]);
?>
