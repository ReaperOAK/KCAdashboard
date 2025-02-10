<?php
require_once '../../config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    exit('Unauthorized');
}

$teacher_id = $_SESSION['user_id'];
$response = [];

// Get today's classes
$query = "SELECT c.*, b.name as batch_name, 
          COUNT(a.id) as total_students,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_students
          FROM classes c
          LEFT JOIN batches b ON c.batch_id = b.id
          LEFT JOIN attendance a ON c.id = a.class_id
          WHERE c.teacher_id = ? AND DATE(c.time) = CURDATE()
          GROUP BY c.id
          ORDER BY c.time ASC";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();
$response['todays_classes'] = $result->fetch_all(MYSQLI_ASSOC);

// Get batch statistics
$query = "SELECT b.*, 
          COUNT(DISTINCT sb.student_id) as total_students,
          AVG(p.grade) as average_grade
          FROM batches b
          LEFT JOIN student_batches sb ON b.id = sb.batch_id
          LEFT JOIN performance p ON sb.student_id = p.student_id
          WHERE b.teacher_id = ?
          GROUP BY b.id";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();
$response['batch_stats'] = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($response);
