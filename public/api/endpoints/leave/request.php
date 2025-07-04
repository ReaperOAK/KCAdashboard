<?php
// endpoints/leave/request.php
require_once __DIR__ . '/../../models/LeaveRequest.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only teachers can request leave
if (!Auth::isTeacher()) {
    http_response_code(403);
    echo json_encode(['error' => 'Only teachers can request leave']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$start = $data['start_datetime'] ?? null;
$end = $data['end_datetime'] ?? null;
$reason = $data['reason'] ?? '';

if (!$start || !$end) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing start or end datetime']);
    exit;
}

LeaveRequest::create(Auth::userId(), $start, $end, $reason);
echo json_encode(['success' => true]);
