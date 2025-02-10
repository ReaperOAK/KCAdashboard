<?php
header('Content-Type: application/json');
require_once '../../config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Insert notification for all users or specific roles
    $stmt = $conn->prepare("INSERT INTO notifications (user_id, role, message) 
                           SELECT id, role, ? FROM users WHERE role IN (?)");
    $stmt->bind_param("ss", $data['message'], $data['targetRoles']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Broadcast sent successfully']);
    } else {
        throw new Exception('Failed to send broadcast');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    error_log($e->getMessage());
}

$conn->close();
