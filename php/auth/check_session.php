<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = ? AND active = 1");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid session']);
    session_destroy();
}

$stmt->close();
$conn->close();
?>
