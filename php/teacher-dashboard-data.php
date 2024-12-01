<?php
header('Content-Type: application/json');
session_start();
include 'config.php'; // Include your database configuration file

// Function to fetch the next class
function getNextClass($conn, $teacherId) {
    $query = "SELECT subject, time FROM classes WHERE teacher_id = ? ORDER BY time ASC LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $teacherId);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Database query failed: " . $stmt->error);
        return null;
    }
    return $result->fetch_assoc();
}

// Function to fetch attendance pending count
function getAttendancePending($conn, $teacherId) {
    $query = "SELECT COUNT(*) as count FROM attendance WHERE teacher_id = ? AND status = 'pending'";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $teacherId);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Database query failed: " . $stmt->error);
        return null;
    }
    $row = $result->fetch_assoc();
    return $row['count'];
}

// Function to fetch batch schedule
function getBatchSchedule($conn, $teacherId) {
    $query = "SELECT name, time FROM batches WHERE teacher_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $teacherId);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Database query failed: " . $stmt->error);
        return null;
    }
    $batchSchedule = [];
    while ($row = $result->fetch_assoc()) {
        $batchSchedule[] = $row;
    }
    return $batchSchedule;
}

// Function to fetch notifications
function getNotifications($conn, $teacherId) {
    $query = "SELECT message FROM notifications WHERE user_id = ? AND role = 'teacher' ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $teacherId);
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

if ($nextClass === null || $attendancePending === null || $batchSchedule === null || $notifications === null) {
    echo json_encode(['success' => false, 'message' => 'Error fetching data']);
    exit;
}

// Return the fetched data as JSON
echo json_encode([
    'nextClass' => $nextClass,
    'attendancePending' => $attendancePending,
    'batchSchedule' => $batchSchedule,
    'notifications' => $notifications,
]);

mysqli_close($conn);
?>