<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id']) || !isset($_SESSION['token'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

require_once 'config.php';

try {
    $stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = ? AND active = 1");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode(['error' => 'User not found']);
        session_destroy();
        exit;
    }

    $user = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

$conn->close();
