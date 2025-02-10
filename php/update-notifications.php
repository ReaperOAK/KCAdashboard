<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);

$missedClass = $data['missedClass'] ? 1 : 0;
$assignmentDue = $data['assignmentDue'] ? 1 : 0;

try {
    $stmt = $conn->prepare("UPDATE users SET missed_class_notifications = ?, assignment_due_notifications = ? WHERE id = ?");
    $stmt->bind_param("iii", $missedClass, $assignmentDue, $user_id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Notification settings updated successfully']);
    } else {
        throw new Exception('Failed to update notification settings');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
