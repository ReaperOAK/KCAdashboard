<?php
require_once 'config.php';
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['userId']) || !isset($data['role'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$userId = $conn->real_escape_string($data['userId']);
$role = $conn->real_escape_string($data['role']);

// Validate role
$validRoles = ['student', 'teacher', 'admin'];
if (!in_array($role, $validRoles)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid role']);
    exit;
}

try {
    $query = "UPDATE users SET role = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('si', $role, $userId);
    
    if ($stmt->execute()) {
        // Log the role change
        $logQuery = "INSERT INTO system_issues (issue) VALUES (?)";
        $logStmt = $conn->prepare($logQuery);
        $logMessage = "User ID: $userId role changed to $role";
        $logStmt->bind_param('s', $logMessage);
        $logStmt->execute();
        
        echo json_encode(['success' => true]);
    } else {
        throw new Exception($stmt->error);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
