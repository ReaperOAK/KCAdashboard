<?php
require_once 'config.php';
session_start();

// Verify teacher is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$teacher_id = $_SESSION['user_id'];

try {
    // Get students from batches assigned to this teacher
    $query = "SELECT DISTINCT u.id, u.name 
              FROM users u 
              INNER JOIN batches b ON b.teacher = ?
              WHERE u.role = 'student' AND u.active = 1
              ORDER BY u.name";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = [
            'id' => $row['id'],
            'name' => $row['name']
        ];
    }
    
    header('Content-Type: application/json');
    echo json_encode($students);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
