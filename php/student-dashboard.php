<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file
require 'vendor/autoload.php'; // Include the JWT library
use \Firebase\JWT\JWT;

// Function to fetch the next class
function getNextClass($conn, $studentId) {
    $query = "SELECT subject, time, link FROM classes WHERE student_id = '$studentId' ORDER BY time ASC LIMIT 1";
    $result = mysqli_query($conn, $query);
    return mysqli_fetch_assoc($result);
}

// Function to fetch attendance data
function getAttendance($conn, $studentId) {
    $query = "SELECT status FROM attendance WHERE student_id = '$studentId'";
    $result = mysqli_query($conn, $query);
    $attendance = ['present' => 0, 'absent' => 0];
    $calendar = [];
    while ($row = mysqli_fetch_assoc($result)) {
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
    $query = "SELECT message FROM notifications WHERE student_id = '$studentId' ORDER BY created_at DESC";
    $result = mysqli_query($conn, $query);
    $notifications = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $notifications[] = $row['message'];
    }
    return $notifications;
}

// Function to fetch performance data
function getPerformance($conn, $studentId) {
    $query = "SELECT subject, grade FROM performance WHERE student_id = '$studentId'";
    $result = mysqli_query($conn, $query);
    $performance = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $performance[] = ['name' => $row['subject'], 'grade' => $row['grade']];
    }
    return $performance;
}

// Get the token from the cookie
if (!isset($_COOKIE['token'])) {
    echo json_encode(['success' => false, 'message' => 'Token not found']);
    exit;
}

$token = $_COOKIE['token'];

// Decode the token to get the student ID
$secret_key = "your_secret_key"; // Replace with your actual secret key
try {
    $decoded = JWT::decode($token, $secret_key, array('HS256'));
    $studentId = $decoded->id;
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}

$nextClass = getNextClass($conn, $studentId);
$attendance = getAttendance($conn, $studentId);
$notifications = getNotifications($conn, $studentId);
$performance = getPerformance($conn, $studentId);

echo json_encode([
    'nextClass' => $nextClass,
    'attendance' => $attendance,
    'notifications' => $notifications,
    'performance' => $performance,
]);

mysqli_close($conn);
?>