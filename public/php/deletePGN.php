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
    // First get the file path
    $stmt = $conn->prepare("
        SELECT file_path FROM pgn_files 
        WHERE id = ? AND teacher_id = ?
    ");
    
    $stmt->bind_param("ii", $pgnId, $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Delete the file
        if (file_exists($row['file_path'])) {
            unlink($row['file_path']);
        }
        
        // Delete shares first (foreign key constraint)
        $stmt = $conn->prepare("DELETE FROM pgn_shares WHERE pgn_id = ?");
        $stmt->bind_param("i", $pgnId);
        $stmt->execute();
        
        // Delete the database entry
        $stmt = $conn->prepare("DELETE FROM pgn_files WHERE id = ?");
        $stmt->bind_param("i", $pgnId);
        $stmt->execute();
        
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('PGN not found or unauthorized');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
