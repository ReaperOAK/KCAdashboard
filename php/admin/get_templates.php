<?php
require_once('../config.php');
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

try {
    $sql = "SELECT * FROM notification_templates ORDER BY id DESC";
    $result = $conn->query($sql);
    
    $templates = array();
    while ($row = $result->fetch_assoc()) {
        $templates[] = array(
            'id' => $row['id'],
            'title' => $row['title'],
            'content' => $row['content'],
            'type' => $row['type']
        );
    }
    
    echo json_encode($templates);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
