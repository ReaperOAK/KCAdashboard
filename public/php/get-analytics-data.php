<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

// Function to fetch attendance trends
function getAttendanceTrends($conn) {
    $query = "SELECT month, AVG(attendance_percentage) as average FROM attendance GROUP BY month";
    $result = mysqli_query($conn, $query);
    if (!$result) {
        error_log("Database query failed: " . mysqli_error($conn));
        return null;
    }
    $trends = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $trends[] = $row;
    }
    return $trends;
}

// Function to fetch grades data
function getGradesData($conn) {
    $query = "SELECT subject, AVG(grade) as average FROM grades GROUP BY subject";
    $result = mysqli_query($conn, $query);
    if (!$result) {
        error_log("Database query failed: " . mysqli_error($conn));
        return null;
    }
    $grades = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $grades[] = $row;
    }
    return $grades;
}

$attendanceTrends = getAttendanceTrends($conn);
$gradesData = getGradesData($conn);

if ($attendanceTrends === null || $gradesData === null) {
    echo json_encode(['success' => false, 'message' => 'Error fetching data']);
    exit;
}

echo json_encode([
    'attendanceTrends' => $attendanceTrends,
    'gradesData' => $gradesData,
]);

mysqli_close($conn);
?>