<?php
require_once('../config.php');
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT 
        s.id,
        s.title,
        s.author,
        s.rating,
        s.description,
        s.created_at
    FROM chess_studies s
    ORDER BY s.created_at DESC");
    
    $stmt->execute();
    $result = $stmt->get_result();
    $studies = $result->fetch_all(MYSQLI_ASSOC);
    
    echo json_encode(['success' => true, 'studies' => $studies]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}

$conn->close();
