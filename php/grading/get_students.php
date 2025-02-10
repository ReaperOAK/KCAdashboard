<?php
require_once('../config.php');
header('Content-Type: application/json');

try {
    $query = "SELECT s.id, s.name, 
              (SELECT rating FROM performance WHERE student_id = s.id ORDER BY id DESC LIMIT 1) as rating 
              FROM users s 
              WHERE s.role = 'student' 
              AND s.id IN (SELECT student_id FROM batches_students WHERE batch_id IN 
                  (SELECT id FROM batches WHERE teacher_id = ?))";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $_GET['teacher_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = array();
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    
    echo json_encode(['success' => true, 'data' => $students]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>
