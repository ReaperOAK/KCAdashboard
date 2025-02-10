<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['class_id']) || !isset($data['attendance'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required data']);
    exit;
}

try {
    $conn->begin_transaction();

    foreach ($data['attendance'] as $student_id => $status) {
        $query = "INSERT INTO attendance (class_id, student_id, status, date) 
                 VALUES (?, ?, ?, CURDATE()) 
                 ON DUPLICATE KEY UPDATE status = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iiss", $data['class_id'], $student_id, $status, $status);
        $stmt->execute();
    }

    $conn->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
