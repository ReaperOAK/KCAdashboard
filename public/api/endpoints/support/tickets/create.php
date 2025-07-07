<?php
// endpoints/support/tickets/create.php
require_once '../../../config/cors.php';
require_once '../../../middleware/auth.php';
require_once '../../../models/SupportTicket.php';

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
$subject = $data['subject'] ?? '';
$message = $data['message'] ?? '';

if (!$subject || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing subject or message']);
    exit;
}

$ticketId = SupportTicket::create($authUser['id'], $subject, $message);
if ($ticketId) {
    echo json_encode(['success' => true, 'ticket_id' => $ticketId]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create support ticket']);
}
