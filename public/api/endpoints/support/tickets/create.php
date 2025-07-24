<?php
// endpoints/support/tickets/create.php
require_once '../../../config/cors.php';
require_once '../../../middleware/auth.php';
require_once '../../../config/Database.php';
require_once '../../../models/Support.php';

$authUser = getAuthUser();
if (!$authUser) {
    http_response_code(403);
    echo json_encode(['error' => 'Authentication required']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$title = $data['title'] ?? '';
$description = $data['description'] ?? '';
$priority = $data['priority'] ?? 'medium';
$category = $data['category'] ?? 'general';

if (!$title || !$description) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing title or description']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    $ticketId = $support->createTicket($authUser['id'], $title, $description, $priority, $category);
    
    if ($ticketId) {
        http_response_code(201);
        echo json_encode(['success' => true, 'ticket_id' => $ticketId]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create support ticket']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error creating support ticket',
        'message' => $e->getMessage()
    ]);
}
?>
