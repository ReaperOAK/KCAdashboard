<?php
header('Content-Type: application/json');
session_start();
include 'config.php'; // Include your database configuration file

// Function to fetch the next class
function getNextClass($conn, $studentId) {
    $query = "SELECT subject, time, link FROM classes WHERE student_id = ? ORDER BY time ASC LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Database query failed: " . $stmt->error);
        return null;
    }
    return $result->fetch_assoc();
}

// Function to fetch attendance data
function getAttendance($conn, $studentId) {
    $query = "SELECT status FROM attendance WHERE student_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Database query failed: " . $stmt->error);
        return null;
    }
    $attendance = ['present' => 0, 'absent' => 0];
    $calendar = [];
    while ($row = $result->fetch_assoc()) {
        $calendar[] = $row['status'];
        if ($row['status'] === 'present') {
            $attendance['present']++;
        } else {
            $attendance['absent']++;
        }
    }
    $totalClasses = $attendance['present'] + $attendance['absent'];
    $percentage = $totalClasses > 0 ? ($attendance['present'] / $totalClasses) * 100 : 0;
    return ['percentage' => $percentage, 'calendar' => $calendar];
}

// Function to fetch notifications
function getNotifications($conn, $studentId) {
    $query = "SELECT message FROM notifications WHERE student_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Database query failed: " . $stmt->error);
        return null;
    }
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row['message'];
    }
    return $notifications;
}

// Function to fetch performance data
function getPerformance($conn, $studentId) {
    $query = "SELECT subject, grade FROM performance WHERE student_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Database query failed: " . $stmt->error);
        return null;
    }
    $performance = [];
    while ($row = $result->fetch_assoc()) {
        $performance[] = ['name' => $row['subject'], 'grade' => $row['grade']];
    }
    return $performance;
}

// Check if the student ID is set in the session
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$studentId = $_SESSION['user_id'];

$nextClass = getNextClass($conn, $studentId);
$attendance = getAttendance($conn, $studentId);
$notifications = getNotifications($conn, $studentId);
$performance = getPerformance($conn, $studentId);

if ($nextClass === null || $attendance === null || $notifications === null || $performance === null) {
    echo json_encode(['success' => false, 'message' => 'Error fetching data']);
    exit;
}

echo json_encode([
    'nextClass' => $nextClass,
    'attendance' => $attendance,
    'notifications' => $notifications,
    'performance' => $performance,
]);

mysqli_close($conn);
?>