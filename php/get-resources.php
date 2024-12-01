<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$query = "SELECT id, category, title, type, link, description FROM resources";
$result = mysqli_query($conn, $query);

if (!$result) {
    error_log("Database query failed: " . mysqli_error($conn));
    echo json_encode(['success' => false, 'message' => 'Error fetching resources']);
    exit;
}

$resources = [];
while ($row = mysqli_fetch_assoc($result)) {
    $resources[] = $row;
}

echo json_encode($resources);

mysqli_close($conn);
?>