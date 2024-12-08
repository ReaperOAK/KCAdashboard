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

// Fetch attendance overview data
$sql = "SELECT DATE_FORMAT(date, '%Y-%m') AS month, AVG(attendance_percentage) AS average
        FROM attendance
        GROUP BY month
        ORDER BY month DESC";
$result = $conn->query($sql);

if (!$result) {
    error_log("Database query failed: " . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Error fetching attendance overview']);
    exit;
}

$overview = [];
while ($row = $result->fetch_assoc()) {
    $overview[] = $row;
}

// Return the overview as JSON
echo json_encode($overview);

// Close the connection
$conn->close();
?>