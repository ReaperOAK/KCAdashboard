<?php
require_once('../config.php');
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!isset($_GET['study_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Study ID required']);
    exit;
}

$study_id = intval($_GET['study_id']);

try {
    $stmt = $conn->prepare("SELECT 
        position_fen,
        move_number,
        comments
    FROM chess_study_positions
    WHERE study_id = ?
    ORDER BY move_number ASC");
    
    $stmt->bind_param("i", $study_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $positions = $result->fetch_all(MYSQLI_ASSOC);
    
    echo json_encode(['success' => true, 'positions' => $positions]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}

$conn->close();
