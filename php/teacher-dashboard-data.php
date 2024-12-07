<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

// Function to fetch the next class
function getNextClass($conn, $teacherId) {
    $query = "SELECT subject, time FROM classes WHERE teacher_id = ? ORDER BY time ASC LIMIT 1";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        return null;
    }
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
    $query = "SELECT COUNT(*) as count FROM attendance WHERE class_id IN (SELECT id FROM classes WHERE teacher_id = ?) AND status = 'pending'";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        return null;
    }
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
    $query = "SELECT name, schedule FROM batches WHERE teacher = (SELECT name FROM users WHERE id = ?)";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        return null;
    }
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
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        return null;
    }
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

$teacherId = $_COOKIE['user_id'];

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