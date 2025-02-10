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
    
    $stmt = $conn->prepare("INSERT INTO tournaments (name, start_date, end_date, status) VALUES (?, ?, ?, 'upcoming')");
    $stmt->bind_param("sss", $data['name'], $data['startDate'], $data['endDate']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Tournament created successfully']);
    } else {
        throw new Exception('Failed to create tournament');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    error_log($e->getMessage());
}

$conn->close();
