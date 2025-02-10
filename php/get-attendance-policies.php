<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT * FROM attendance_policies LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $policies = $result->fetch_assoc();
        echo json_encode([
            'threshold' => (int)$policies['threshold'],
            'reminder' => (int)$policies['reminder']
        ]);
    } else {
        echo json_encode(['threshold' => 75, 'reminder' => 3]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
