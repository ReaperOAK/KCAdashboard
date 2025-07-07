<?php
// endpoints/leave/requests.php
require_once '../../../config/cors.php';
require_once '../../../models/LeaveRequest.php';
require_once '../../../middleware/auth.php';

try {
    $user = getAuthUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    if ($user['role'] === 'admin') {
        $requests = LeaveRequest::getAll();
    } else if ($user['role'] === 'teacher') {
        $requests = LeaveRequest::getByTeacher($user['id']);
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    echo json_encode($requests);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
