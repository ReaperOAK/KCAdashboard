<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$query = "SELECT id, name, schedule, teacher FROM batches";
$result = mysqli_query($conn, $query);

if (!$result) {
    error_log("Database query failed: " . mysqli_error($conn));
    echo json_encode(['success' => false, 'message' => 'Error fetching batches']);
    exit;
}

$batches = [];
while ($row = mysqli_fetch_assoc($result)) {
    $batches[] = $row;
}

echo json_encode($batches);

mysqli_close($conn);
?>