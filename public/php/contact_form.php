<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $conn->prepare("INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $data['name'], $data['email'], $data['message']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
    } else {
        throw new Exception('Failed to send message');
    }
    
    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
