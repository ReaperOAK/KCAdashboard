<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$query = "SELECT id, title, status FROM assignments";
$result = mysqli_query($conn, $query);

if (!$result) {
    error_log("Database query failed: " . mysqli_error($conn));
    echo json_encode(['success' => false, 'message' => 'Error fetching assignments']);
    exit;
}

$assignments = [];
while ($row = mysqli_fetch_assoc($result)) {
    $assignments[] = $row;
}

echo json_encode($assignments);

mysqli_close($conn);
?>