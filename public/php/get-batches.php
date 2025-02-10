<?php
require_once 'config.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->prepare("SELECT id, name, schedule, teacher FROM batches");
    $stmt->execute();
    $result = $stmt->get_result();
    $batches = array();
    
    while($row = $result->fetch_assoc()) {
        $batches[] = $row;
    }
    
    echo json_encode($batches);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
