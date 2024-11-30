<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file
require 'vendor/autoload.php'; // Include the JWT library
use \Firebase\JWT\JWT;

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

// Get the token from the cookie
if (!isset($_COOKIE['token'])) {
    echo json_encode(['success' => false, 'message' => 'Token not found']);
    exit;
}

$token = $_COOKIE['token'];

// Decode the token to get the teacher ID
$secret_key = "your_secret_key"; // Replace with your actual secret key
try {
    $decoded = JWT::decode($token, $secret_key, array('HS256'));
    $teacherId = $decoded->id;
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}

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