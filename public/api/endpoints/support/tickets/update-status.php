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

// Only admins and teachers can update ticket status
if (!in_array($authUser['role'], ['admin', 'teacher'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Permission denied']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$ticket_id = $data['ticket_id'] ?? '';
$status = $data['status'] ?? '';

if (!$ticket_id || !$status) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing ticket_id or status']);
    exit;
}

// Validate status
$valid_statuses = ['open', 'in_progress', 'resolved', 'closed'];
if (!in_array($status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    $result = $support->updateTicketStatus($ticket_id, $status);
    
    if ($result) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Ticket status updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update ticket status']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error updating ticket status',
        'message' => $e->getMessage()
    ]);
}
?>
