<?php
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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$ticket_id = $_GET['ticket_id'] ?? '';

if (!$ticket_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing ticket_id']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    // Check if user has permission to view this ticket
    $ticket = $support->getTicketById($ticket_id);
    if (!$ticket) {
        http_response_code(404);
        echo json_encode(['error' => 'Ticket not found']);
        exit;
    }

    // Students can only see their own tickets, admins/teachers can see all
    if ($authUser['role'] === 'student' && $ticket['user_id'] != $authUser['id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Permission denied']);
        exit;
    }

    $replies = $support->getTicketReplies($ticket_id);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'replies' => $replies
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error fetching ticket replies',
        'message' => $e->getMessage()
    ]);
}
?>
