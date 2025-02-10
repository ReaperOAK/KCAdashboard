<?php
header('Content-Type: application/json');
require_once('../config.php');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Check if the request is POST and has the required data
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['senderId']) || !isset($data['receiverId']) || !isset($data['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$senderId = $conn->real_escape_string($data['senderId']);
$receiverId = $conn->real_escape_string($data['receiverId']);
$message = $conn->real_escape_string($data['message']);

// First, get or create chat
$chatQuery = "SELECT id FROM chats 
             WHERE (user1_id = ? AND user2_id = ?)
             OR (user1_id = ? AND user2_id = ?)
             LIMIT 1";

$stmt = $conn->prepare($chatQuery);
$stmt->bind_param("iiii", $senderId, $receiverId, $receiverId, $senderId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Create new chat
    $createChatQuery = "INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)";
    $stmt = $conn->prepare($createChatQuery);
    $stmt->bind_param("ii", $senderId, $receiverId);
    $stmt->execute();
    $chatId = $conn->insert_id;
} else {
    $chat = $result->fetch_assoc();
    $chatId = $chat['id'];
}

// Insert message
$insertQuery = "INSERT INTO messages (chat_id, sender_id, message) VALUES (?, ?, ?)";
$stmt = $conn->prepare($insertQuery);
$stmt->bind_param("iis", $chatId, $senderId, $message);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'messageId' => $conn->insert_id,
        'chatId' => $chatId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message']);
}

$stmt->close();
$conn->close();
