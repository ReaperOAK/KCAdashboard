<?php
header('Content-Type: application/json');
require_once '../../config.php';
session_start();

// Check if user is admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

try {
    // Get total students
    $studentQuery = "SELECT COUNT(*) as total FROM users WHERE role = 'student' AND active = 1";
    $result = $conn->query($studentQuery);
    $totalStudents = $result->fetch_assoc()['total'];

    // Get total teachers
    $teacherQuery = "SELECT COUNT(*) as total FROM users WHERE role = 'teacher' AND active = 1";
    $result = $conn->query($teacherQuery);
    $totalTeachers = $result->fetch_assoc()['total'];

    // Get active classes
    $classesQuery = "SELECT COUNT(*) as total FROM classes WHERE time >= CURDATE()";
    $result = $conn->query($classesQuery);
    $activeClasses = $result->fetch_assoc()['total'];

    // Get ongoing tournaments (assuming we have a tournaments table)
    $tournamentsQuery = "SELECT COUNT(*) as total FROM tournaments WHERE status = 'ongoing'";
    $result = $conn->query($tournamentsQuery);
    $ongoingTournaments = $result->fetch_assoc()['total'];

    $response = [
        'totalStudents' => $totalStudents,
        'totalTeachers' => $totalTeachers,
        'activeClasses' => $activeClasses,
        'ongoingTournaments' => $ongoingTournaments
    ];

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
    error_log($e->getMessage());
}

$conn->close();
