<?php
require_once 'config.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->prepare("SELECT id, name, email FROM users WHERE role = 'student' AND active = 1");
    $stmt->execute();
    $result = $stmt->get_result();
    $students = array();
    
    while($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    
    echo json_encode($students);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
