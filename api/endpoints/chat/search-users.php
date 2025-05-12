<?php
// search-users.php - Search users for creating a new conversation

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

// Check if search_term parameter exists
if (!isset($_GET['search_term'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Search term is required']);
    exit;
}

// Get search term
$searchTerm = $_GET['search_term'];

// Get database connection
$database = new Database();
$db = $database->connect();

// Initialize chat model
$chat = new Chat($db);

// Search users
$result = $chat->searchUsers($searchTerm, $user['id']);

// Return response
if ($result['success']) {
    http_response_code(200);
    echo json_encode($result);
} else {
    http_response_code(500);
    echo json_encode($result);
}
?>