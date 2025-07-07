<?php
// endpoints/leave/requests.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../models/LeaveRequest.php';
require_once __DIR__ . '/../../middleware/auth.php';

if (Auth::isAdmin()) {
    $requests = LeaveRequest::getAll();
} else if (Auth::isTeacher()) {
    $requests = LeaveRequest::getByTeacher(Auth::userId());
} else {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

echo json_encode($requests);
