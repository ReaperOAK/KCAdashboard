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
$date = isset($_POST['date']) ? $_POST['date'] : date('Y-m-d');

try {
    // Get all students in teacher's batches
    $query = "SELECT DISTINCT u.id 
              FROM users u 
              INNER JOIN batches b ON b.teacher = ?
              WHERE u.role = 'student' AND u.active = 1";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $attendance = [];
    while ($row = $result->fetch_assoc()) {
        // Default all students to absent
        $attendance[$row['id']] = [
            'present' => false,
            'absent' => true
        ];
    }
    
    // Get attendance records for the day
    $query = "SELECT student_id, status 
              FROM attendance 
              WHERE DATE(date) = ? AND class_id IN 
                (SELECT id FROM classes WHERE teacher_id = ?)";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("si", $date, $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $attendance[$row['student_id']] = [
            'present' => $row['status'] === 'present',
            'absent' => $row['status'] === 'absent'
        ];
    }
    
    header('Content-Type: application/json');
    echo json_encode($attendance);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
