<?php
header('Content-Type: application/json');
require_once('../config.php');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!isset($_GET['userId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

$userId = $conn->real_escape_string($_GET['userId']);

$query = "SELECT c.*, 
          u.name as other_user_name,
          u.profile_picture as other_user_picture,
          (SELECT message FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
          FROM chats c
          JOIN users u ON (c.user1_id = u.id OR c.user2_id = u.id)
          WHERE (c.user1_id = ? OR c.user2_id = ?)
          AND u.id != ?
          ORDER BY last_message_time DESC";

$stmt = $conn->prepare($query);
$stmt->bind_param("iii", $userId, $userId, $userId);
$stmt->execute();
$result = $stmt->get_result();

$chats = [];
while ($row = $result->fetch_assoc()) {
    $chats[] = $row;
}

echo json_encode($chats);
$stmt->close();
$conn->close();
