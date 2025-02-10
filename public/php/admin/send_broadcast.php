<?php
require_once('../config.php');
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['title']) || !isset($data['message']) || !isset($data['urgency'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();

    // Insert into notifications table
    $stmt = $conn->prepare("INSERT INTO notifications (title, message, urgency, created_by, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("sssi", $data['title'], $data['message'], $data['urgency'], $_SESSION['user_id']);
    $stmt->execute();
    $notification_id = $conn->insert_id;

    // Get all active users
    $user_query = "SELECT id FROM users WHERE active = 1";
    $users_result = $conn->query($user_query);

    // Insert notification for each user
    $user_notification_stmt = $conn->prepare("INSERT INTO user_notifications (user_id, notification_id, is_read) VALUES (?, ?, 0)");
    
    while ($user = $users_result->fetch_assoc()) {
        $user_notification_stmt->bind_param("ii", $user['id'], $notification_id);
        $user_notification_stmt->execute();
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Broadcast sent successfully']);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
