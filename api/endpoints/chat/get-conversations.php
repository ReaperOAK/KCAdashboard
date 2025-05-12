<?php
// get-conversations.php - Get all conversations for the current user

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

// Get database connection
$database = new Database();
$db = $database->connect();

// Initialize chat model
$chat = new Chat($db);

// Get all conversations for the current user
$result = $chat->getUserConversations($user['id']);

// Return response
if ($result['success']) {
    http_response_code(200);
    echo json_encode($result);
} else {
    http_response_code(500);
    echo json_encode($result);
}
?>