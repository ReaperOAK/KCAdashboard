<?php
require_once('../config.php');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $conn->prepare("INSERT INTO game_analysis (student_id, teacher_id, analysis, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("iis", 
        $data['student_id'],
        $data['teacher_id'],
        $data['analysis']
    );
    
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        // Send notification to student
        $notify_stmt = $conn->prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'analysis')");
        $message = "New game analysis available from your teacher";
        $notify_stmt->bind_param("is", $data['student_id'], $message);
        $notify_stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Analysis submitted successfully']);
    } else {
        throw new Exception('Failed to submit analysis');
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>
