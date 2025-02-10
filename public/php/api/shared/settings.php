<?php
require_once '../../config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    exit('Unauthorized');
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = "SELECT name, email, profile_picture, 
              missed_class_notifications, 
              assignment_due_notifications 
              FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "UPDATE users SET 
              missed_class_notifications = ?,
              assignment_due_notifications = ?
              WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iii", 
        $data['missed_class_notifications'],
        $data['assignment_due_notifications'],
        $user_id
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update settings']);
    }
}
