<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['threshold']) || !isset($data['reminder'])) {
        throw new Exception('Missing required fields');
    }

    $threshold = (int)$data['threshold'];
    $reminder = (int)$data['reminder'];

    // Validate inputs
    if ($threshold < 0 || $threshold > 100 || $reminder < 0) {
        throw new Exception('Invalid values provided');
    }

    $sql = "INSERT INTO attendance_policies (threshold, reminder) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE 
            threshold = VALUES(threshold), 
            reminder = VALUES(reminder)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $threshold, $reminder);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Failed to save policies');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
