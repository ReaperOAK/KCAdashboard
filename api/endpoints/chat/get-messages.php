<?php
// get-messages.php - Get messages from a conversation

require_once '../../config/Database.php';
require_once '../../models/Chat.php';
require_once '../../middleware/auth.php';

// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

// Check if conversation_id parameter exists
if (!isset($_GET['conversation_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Conversation ID is required']);
    exit;
}

// Get parameters
$conversationId = $_GET['conversation_id'];
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

// Get database connection
$database = new Database();
$db = $database->connect();

// Initialize chat model
$chat = new Chat($db);

// Get messages from the conversation
$result = $chat->getConversationMessages($conversationId, $user['id'], $limit, $offset);

// Return response
if ($result['success']) {
    http_response_code(200);
    echo json_encode($result);
} else {
    $statusCode = $result['message'] === 'You are not a participant in this conversation' ? 403 : 500;
    http_response_code($statusCode);
    echo json_encode($result);
}
?>