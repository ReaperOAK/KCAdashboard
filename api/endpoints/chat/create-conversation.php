<?php
// create-conversation.php - Create a new conversation

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
if (!isset($data['name']) || !isset($data['participant_ids']) || !isset($data['type'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name, participant IDs, and type are required']);
    exit;
}

// Ensure participant_ids is an array and includes the current user
$participantIds = $data['participant_ids'];
if (!is_array($participantIds)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Participant IDs must be an array']);
    exit;
}

// Make sure the current user is included in the participants
if (!in_array($user['id'], $participantIds)) {
    $participantIds[] = $user['id'];
}

// Get database connection
$database = new Database();
$db = $database->connect();

// Initialize chat model
$chat = new Chat($db);

// Create the conversation
$result = $chat->createConversation($data['name'], $data['type'], $participantIds);

// Return response
if ($result['success']) {
    http_response_code(201); // Created
    echo json_encode($result);
} else {
    http_response_code(500);
    echo json_encode($result);
}
?>