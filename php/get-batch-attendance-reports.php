<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

// Start the session
session_start();

// Check if the user is logged in and is an admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Fetch batch-wide attendance reports
$sql = "SELECT b.name AS batchName, AVG(a.attendance_percentage) AS attendancePercentage
        FROM batches b
        JOIN classes c ON b.id = c.batch_id
        JOIN attendance a ON c.id = a.class_id
        GROUP BY b.id";
$result = $conn->query($sql);

if (!$result) {
    error_log("Database query failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Error fetching attendance reports']);
    exit;
}

$reports = [];
while ($row = $result->fetch_assoc()) {
    $reports[] = $row;
}

// Return the reports as JSON
echo json_encode($reports);

// Close the connection
$conn->close();
?>