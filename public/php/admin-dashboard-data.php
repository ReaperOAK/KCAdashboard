<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

// Function to fetch active users count
function getActiveUsers($conn) {
    $query = "SELECT COUNT(*) as count FROM users WHERE active = 1";
    $result = mysqli_query($conn, $query);
    if (!$result) {
        error_log("Database query failed: " . mysqli_error($conn));
        return null;
    }
    $row = mysqli_fetch_assoc($result);
    return $row['count'];
}

// Function to fetch attendance trends
function getAttendanceTrends($conn) {
    $query = "SELECT AVG(attendance_percentage) as average FROM attendance";
    $result = mysqli_query($conn, $query);
    if (!$result) {
        error_log("Database query failed: " . mysqli_error($conn));
        return null;
    }
    $row = mysqli_fetch_assoc($result);
    return $row['average'] . '% average attendance';
}

// Function to fetch system issues
function getSystemIssues($conn) {
    $query = "SELECT issue FROM system_issues ORDER BY created_at DESC";
    $result = mysqli_query($conn, $query);
    if (!$result) {
        error_log("Database query failed: " . mysqli_error($conn));
        return null;
    }
    $issues = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $issues[] = $row['issue'];
    }
    return $issues;
}

// Fetch data for the admin dashboard
$activeUsers = getActiveUsers($conn);
$attendanceTrends = getAttendanceTrends($conn);
$systemIssues = getSystemIssues($conn);

// Check if any data fetching failed
if ($activeUsers === null || $attendanceTrends === null || $systemIssues === null) {
    echo json_encode(['success' => false, 'message' => 'Error fetching data']);
    exit;
}

// Return the fetched data as JSON
echo json_encode([
    'activeUsers' => $activeUsers,
    'attendanceTrends' => $attendanceTrends,
    'systemIssues' => $systemIssues,
]);

mysqli_close($conn);
?>