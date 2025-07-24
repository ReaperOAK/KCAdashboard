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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$ticket_id = $data['ticket_id'] ?? '';
$message = $data['message'] ?? '';

if (!$ticket_id || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing ticket_id or message']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    // Check if user has permission to reply to this ticket
    $ticket = $support->getTicketById($ticket_id);
    if (!$ticket) {
        http_response_code(404);
        echo json_encode(['error' => 'Ticket not found']);
        exit;
    }

    // Students can only reply to their own tickets, admins/teachers can reply to all
    if ($authUser['role'] === 'student' && $ticket['user_id'] != $authUser['id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Permission denied']);
        exit;
    }

    $reply_id = $support->addTicketReply($ticket_id, $authUser['id'], $message);
    
    if ($reply_id) {
        // Update ticket status to in_progress if it was open and reply is from admin/teacher
        if ($ticket['status'] === 'open' && in_array($authUser['role'], ['admin', 'teacher'])) {
            $support->updateTicketStatus($ticket_id, 'in_progress');
        }

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'reply_id' => $reply_id,
            'message' => 'Reply added successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to add reply']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error adding ticket reply',
        'message' => $e->getMessage()
    ]);
}
?>
