<?php
// endpoints/leave/approve.php
require_once '../../../config/cors.php';
require_once '../../../models/LeaveRequest.php';
require_once '../../../middleware/auth.php';

$user = getAuthUser();
if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Only admin can approve/reject leave']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$status = $data['status'] ?? null; // approved or rejected
$comment = $data['admin_comment'] ?? null;

if (!$id || !in_array($status, ['approved', 'rejected'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

LeaveRequest::updateStatus($id, $status, $comment);
echo json_encode(['success' => true]);
