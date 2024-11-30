<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

// Function to fetch active users count
function getActiveUsers($conn) {
    $query = "SELECT COUNT(*) as count FROM users WHERE active = 1";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_assoc($result);
    return $row['count'];
}

// Function to fetch attendance trends
function getAttendanceTrends($conn) {
    $query = "SELECT AVG(attendance_percentage) as average FROM attendance";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_assoc($result);
    return $row['average'] . '% average attendance';
}

// Function to fetch system issues
function getSystemIssues($conn) {
    $query = "SELECT issue FROM system_issues ORDER BY created_at DESC";
    $result = mysqli_query($conn, $query);
    $issues = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $issues[] = $row['issue'];
    }
    return $issues;
}

$activeUsers = getActiveUsers($conn);
$attendanceTrends = getAttendanceTrends($conn);
$systemIssues = getSystemIssues($conn);

echo json_encode([
    'activeUsers' => $activeUsers,
    'attendanceTrends' => $attendanceTrends,
    'systemIssues' => $systemIssues,
]);

mysqli_close($conn);
?>