<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['subject']) || !isset($input['description'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$user_id = $_SESSION['user_id'];
$subject = trim($input['subject']);
$description = trim($input['description']);

// Validate input
if (empty($subject) || empty($description)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty fields not allowed']);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO support_tickets (user_id, subject, description, status) 
                           VALUES (?, ?, ?, 'Pending')");
    $stmt->bind_param("iss", $user_id, $subject, $description);
    
    if ($stmt->execute()) {
        $ticket_id = $stmt->insert_id;
        
        // Send notification to admin (optional)
        $notify_stmt = $conn->prepare("INSERT INTO notifications (user_id, role, message) 
                                     SELECT id, 'admin', ? 
                                     FROM users 
                                     WHERE role = 'admin'");
        $notify_message = "New support ticket submitted: " . $subject;
        $notify_stmt->bind_param("s", $notify_message);
        $notify_stmt->execute();
        
        echo json_encode([
            'success' => true,
            'id' => $ticket_id,
            'message' => 'Ticket submitted successfully'
        ]);
    } else {
        throw new Exception('Failed to insert ticket');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
    error_log($e->getMessage());
}

$stmt->close();
if (isset($notify_stmt)) {
    $notify_stmt->close();
}
$conn->close();
