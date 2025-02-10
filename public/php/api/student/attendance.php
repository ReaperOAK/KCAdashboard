<?php
require_once '../../config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(403);
    exit('Unauthorized');
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $month = isset($_GET['month']) ? $_GET['month'] : date('m');
    $year = isset($_GET['year']) ? $_GET['year'] : date('Y');

    $query = "SELECT a.*, c.subject, c.time
              FROM attendance a
              JOIN classes c ON a.class_id = c.id
              WHERE a.student_id = ? 
              AND MONTH(a.date) = ? 
              AND YEAR(a.date) = ?
              ORDER BY a.date DESC";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("iii", $user_id, $month, $year);
    $stmt->execute();
    $result = $stmt->get_result();
    
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
}
