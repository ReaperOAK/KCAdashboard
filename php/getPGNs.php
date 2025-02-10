<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT p.id, p.title, p.upload_date, 
        GROUP_CONCAT(DISTINCT u.name) as shared_with
        FROM pgn_files p
        LEFT JOIN pgn_shares ps ON p.id = ps.pgn_id
        LEFT JOIN users u ON ps.user_id = u.id
        WHERE p.teacher_id = ?
        GROUP BY p.id
        ORDER BY p.upload_date DESC
    ");
    
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $pgns = [];
    while ($row = $result->fetch_assoc()) {
        $pgns[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'uploadDate' => $row['upload_date'],
            'sharedWith' => $row['shared_with'] ?? 'Not shared'
        ];
    }
    
    echo json_encode($pgns);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

$stmt->close();
$conn->close();
