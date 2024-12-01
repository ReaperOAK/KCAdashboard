<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$query = "SELECT issue, created_at FROM system_issues ORDER BY created_at DESC";
$result = mysqli_query($conn, $query);

if (!$result) {
    error_log("Database query failed: " . mysqli_error($conn));
    echo json_encode(['success' => false, 'message' => 'Error fetching system issues']);
    exit;
}

$issues = [];
while ($row = mysqli_fetch_assoc($result)) {
    $issues[] = $row;
}

echo json_encode($issues);

mysqli_close($conn);
?>