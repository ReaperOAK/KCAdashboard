<?php
header('Content-Type: application/json');
session_start();
include 'config.php'; // Include your database configuration file

// Function to fetch the next class
function getNextClass($conn, $teacherId) {
    $query = "SELECT subject, time FROM classes WHERE teacher_id = '$teacherId' ORDER BY time ASC LIMIT 1";
    $result = mysqli_query($conn, $query);
    return mysqli_fetch_assoc($result);
}

// Function to fetch attendance pending count
function getAttendancePending($conn, $teacherId) {
    $query = "SELECT COUNT(*) as count FROM attendance WHERE teacher_id = '$teacherId' AND status = 'pending'";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_assoc($result);
    return $row['count'];
}

// Function to fetch batch schedule
function getBatchSchedule($conn, $teacherId) {
    $query = "SELECT name, time FROM batches WHERE teacher_id = '$teacherId'";
    $result = mysqli_query($conn, $query);
    $batchSchedule = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $batchSchedule[] = $row;
    }
    return $batchSchedule;
}

// Function to fetch notifications
function getNotifications($conn, $teacherId) {
    $query = "SELECT message FROM notifications WHERE teacher_id = '$teacherId' ORDER BY created_at DESC";
    $result = mysqli_query($conn, $query);
    $notifications = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $notifications[] = $row['message'];
    }
    return $notifications;
}

// Check if the teacher ID is set in the session
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$teacherId = $_SESSION['user_id'];

$nextClass = getNextClass($conn, $teacherId);
$attendancePending = getAttendancePending($conn, $teacherId);
$batchSchedule = getBatchSchedule($conn, $teacherId);
$notifications = getNotifications($conn, $teacherId);

echo json_encode([
    'nextClass' => $nextClass,
    'attendancePending' => $attendancePending,
    'batchSchedule' => $batchSchedule,
    'notifications' => $notifications,
]);

mysqli_close($conn);
?>