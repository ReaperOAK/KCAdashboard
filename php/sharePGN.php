<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$pgnId = $data['id'] ?? null;

try {
    // First verify that the PGN belongs to the teacher
    $stmt = $conn->prepare("
        SELECT id FROM pgn_files 
        WHERE id = ? AND teacher_id = ?
    ");
    
    $stmt->bind_param("ii", $pgnId, $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('PGN not found or unauthorized');
    }
    
    // Add sharing logic here
    // This is a simplified example - you might want to add specific users to share with
    $stmt = $conn->prepare("
        INSERT INTO pgn_shares (pgn_id, user_id, shared_date)
        SELECT ?, id, NOW()
        FROM users
        WHERE role = 'student'
    ");
    
    $stmt->bind_param("i", $pgnId);
    $stmt->execute();
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
