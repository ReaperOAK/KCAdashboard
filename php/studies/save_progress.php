<?php
require_once('../config.php');
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['study_id']) || !isset($data['current_position'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO user_study_progress 
        (user_id, study_id, current_position, last_accessed) 
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        current_position = VALUES(current_position),
        last_accessed = NOW()");
    
    $stmt->bind_param("iis", 
        $_SESSION['user_id'],
        $data['study_id'],
        $data['current_position']
    );
    
    $stmt->execute();
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}

$conn->close();
