<?php
// Start the session
session_start();

// Destroy the session
session_destroy();

// Return a success response
echo json_encode(['success' => true]);
?>