<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

function sendResponse($status, $data = []) {
    echo json_encode(array_merge(['status' => $status], $data));
    exit;
}

// Check if user is logged in via session
if (!isset($_SESSION['user_id'])) {
    sendResponse('error', ['message' => 'No valid session found']);
}

try {
    $stmt = $conn->prepare("SELECT id, name, email, role, missed_class_notifications, 
                           assignment_due_notifications, active 
                           FROM users 
                           WHERE id = ? AND active = 1");
    
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Clear invalid session
        session_destroy();
        sendResponse('error', ['message' => 'User not found or inactive']);
    }

    $user = $result->fetch_assoc();

    // Update last activity timestamp
    $_SESSION['last_activity'] = time();

    sendResponse('success', [
        'role' => $user['role'],
        'name' => $user['name'],
        'email' => $user['email'],
        'missed_class_notifications' => (bool)$user['missed_class_notifications'],
        'assignment_due_notifications' => (bool)$user['assignment_due_notifications']
    ]);

} catch (Exception $e) {
    error_log("Token validation error: " . $e->getMessage());
    sendResponse('error', ['message' => 'Server error during validation']);
}

$stmt->close();
$conn->close();
?>
