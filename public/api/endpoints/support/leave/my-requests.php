<?php
// endpoints/support/leave/my-requests.php
require_once '../../../config/cors.php';
require_once '../../../models/LeaveRequest.php';
require_once '../../../middleware/auth.php';

$authUser = getAuthUser();
if (!$authUser || $authUser['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Only teachers can access their leave requests']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all leave requests for this teacher
    $requests = LeaveRequest::getByTeacher($authUser['id']);
    echo json_encode($requests);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Cancel a leave request (only if pending and belongs to this teacher)
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing leave request id']);
        exit;
    }
    $success = LeaveRequest::cancelIfPending($id, $authUser['id']);
    if ($success) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Unable to cancel leave request']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
