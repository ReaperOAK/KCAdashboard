<?php
require_once 'config.php';
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['userId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'User ID is required']);
    exit;
}

$userId = $conn->real_escape_string($data['userId']);

try {
    // Start transaction
    $conn->begin_transaction();

    // First, check if user is an admin
    $checkAdmin = "SELECT role FROM users WHERE id = ?";
    $stmt = $conn->prepare($checkAdmin);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user['role'] === 'admin') {
        // Check if this is the last admin
        $adminCount = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")->fetch_assoc()['count'];
        if ($adminCount <= 1) {
            throw new Exception('Cannot delete the last admin user');
        }
    }

    // Delete related records first
    $tables = ['attendance', 'grades', 'notifications', 'support_tickets'];
    foreach ($tables as $table) {
        $query = "DELETE FROM $table WHERE user_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
    }

    // Finally, delete the user
    $query = "DELETE FROM users WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $userId);
    
    if ($stmt->execute()) {
        // Log the deletion
        $logQuery = "INSERT INTO system_issues (issue) VALUES (?)";
        $logStmt = $conn->prepare($logQuery);
        $logMessage = "User ID: $userId has been deleted from the system";
        $logStmt->bind_param('s', $logMessage);
        $logStmt->execute();

        $conn->commit();
        echo json_encode(['success' => true]);
    } else {
        throw new Exception($stmt->error);
    }
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
