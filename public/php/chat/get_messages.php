<?php
header('Content-Type: application/json');
require_once('../config.php');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!isset($_GET['chatId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Chat ID is required']);
    exit;
}

$user_id = $_SESSION['user_id'];
$chatId = $conn->real_escape_string($_GET['chatId']);

$query = "SELECT m.*, 
          u.name as sender_name,
          u.profile_picture as sender_picture
          FROM messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.chat_id = ?
          ORDER BY m.created_at ASC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $chatId);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode($messages);
$stmt->close();
$conn->close();
