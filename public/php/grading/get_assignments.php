<?php
require_once('../config.php');
header('Content-Type: application/json');

try {
    $query = "SELECT id, title, 
                     CASE 
                        WHEN type = 'pgn' THEN 'PGN Analysis'
                        WHEN type = 'puzzle' THEN 'Chess Puzzle'
                        ELSE 'Game Analysis'
                     END as type,
                     status 
              FROM assignments 
              WHERE teacher_id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $_GET['teacher_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $assignments = array();
    while ($row = $result->fetch_assoc()) {
        $assignments[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $assignments]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>
