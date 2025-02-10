<?php
require_once('../config.php');
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

try {
    $autoReply = $data['autoReply'] ? 1 : 0;
    $smartRouting = $data['smartRouting'] ? 1 : 0;
    $responseDelay = intval($data['responseDelay']);
    
    $query = "UPDATE support_settings SET 
              auto_reply = ?, 
              smart_routing = ?, 
              response_delay = ?
              WHERE id = 1";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iii", $autoReply, $smartRouting, $responseDelay);
    $stmt->execute();
    
    echo json_encode(['success' => true, 'message' => 'Settings updated successfully']);
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>
