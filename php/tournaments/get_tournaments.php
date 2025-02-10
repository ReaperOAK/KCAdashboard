<?php
require_once('../config.php');
header('Content-Type: application/json');

try {
    $query = "SELECT t.id, t.name, DATE_FORMAT(t.date, '%Y-%m-%d %H:%i') as date, 
              t.format, t.status, t.max_participants, t.current_participants 
              FROM tournaments t 
              ORDER BY t.date DESC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception($conn->error);
    }
    
    $tournaments = array();
    while ($row = $result->fetch_assoc()) {
        // Add registration status
        $row['status'] = ($row['current_participants'] >= $row['max_participants']) 
            ? 'Full' 
            : (strtotime($row['date']) < time() ? 'Closed' : 'Open');
            
        unset($row['max_participants']);
        unset($row['current_participants']);
        $tournaments[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $tournaments]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>
