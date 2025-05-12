<?php
// send-message.php - Send a message in a conversation

require_once '../../config/Database.php';
require_once '../../models/Chat.php';
require_once '../../middleware/auth.php';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the authenticated user
$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get the request body
$data = json_decode(file_get_contents('php://input'), true);

// Check if all required fields are present
if (!isset($data['conversation_id']) || !isset($data['content']) || empty(trim($data['content']))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Conversation ID and message content are required']);
    exit;
}

// Get database connection
$database = new Database();
$db = $database->connect();

// Initialize chat model
$chat = new Chat($db);

// Send the message
$result = $chat->sendMessage($data['conversation_id'], $user['id'], $data['content']);

// Return response
if ($result['success']) {
    http_response_code(201); // Created
    echo json_encode($result);
} else {
    $statusCode = $result['message'] === 'You are not a participant in this conversation' ? 403 : 500;
    http_response_code($statusCode);
    echo json_encode($result);
}
?>