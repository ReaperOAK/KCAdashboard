<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

// Prepare the SQL query to fetch resources
$query = "SELECT id, category, title, type, link, description FROM resources";
$result = mysqli_query($conn, $query);

// Check if the query was successful
if (!$result) {
    error_log("Database query failed: " . mysqli_error($conn));
    echo json_encode(['success' => false, 'message' => 'Error fetching resources']);
    exit;
}

// Fetch the resources and store them in an array
$resources = [];
while ($row = mysqli_fetch_assoc($result)) {
    $resources[] = $row;
}

// Return the resources as JSON
echo json_encode(['success' => true, 'resources' => $resources]);

// Close the database connection
mysqli_close($conn);
?>