<?php
require_once '../config.php';
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$action = $_GET['action'] ?? '';
$teacher_id = $_SESSION['user_id'];

switch ($action) {
    case 'getAttendance':
        $batch_id = $_GET['batch_id'] ?? null;
        $date = $_GET['date'] ?? date('Y-m-d');
        
        $query = "SELECT a.*, u.name as student_name 
                 FROM attendance a 
                 JOIN users u ON a.student_id = u.id 
                 WHERE a.class_id IN (SELECT id FROM classes WHERE teacher_id = ? AND batch_id = ?) 
                 AND a.date = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iis", $teacher_id, $batch_id, $date);
        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        break;

    case 'markAttendance':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $conn->prepare("INSERT INTO attendance (class_id, student_id, status, date) 
                              VALUES (?, ?, ?, ?) 
                              ON DUPLICATE KEY UPDATE status = ?");
                              
        foreach ($data['attendance'] as $record) {
            $stmt->bind_param("iisss", 
                $record['class_id'], 
                $record['student_id'], 
                $record['status'], 
                $data['date'],
                $record['status']
            );
            $stmt->execute();
        }
        
        echo json_encode(['success' => true]);
        break;
}

$stmt->close();
$conn->close();
