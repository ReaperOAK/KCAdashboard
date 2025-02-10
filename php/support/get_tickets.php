<?php
require_once('../config.php');
header('Content-Type: application/json');

try {
    $query = "SELECT id, subject, description, status, created_at, user_id 
              FROM support_tickets 
              ORDER BY created_at DESC";
    $result = $conn->query($query);
    
    $tickets = array();
    while($row = $result->fetch_assoc()) {
        $tickets[] = array(
            'id' => $row['id'],
            'subject' => $row['subject'],
            'description' => $row['description'],
            'status' => $row['status'],
            'created_at' => $row['created_at']
        );
    }
    
    echo json_encode(['success' => true, 'data' => $tickets]);
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>
