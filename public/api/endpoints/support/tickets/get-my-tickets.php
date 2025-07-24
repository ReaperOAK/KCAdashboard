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

try {
    $database = new Database();
    $db = $database->getConnection();
    $support = new Support($db);

    $tickets = $support->getMyTickets($authUser['id']);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'tickets' => $tickets
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error fetching your tickets',
        'message' => $e->getMessage()
    ]);
}
?>
