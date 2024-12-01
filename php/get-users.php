<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

$query = "SELECT id, name, email, role FROM users";
$result = mysqli_query($conn, $query);

if (!$result) {
    error_log("Database query failed: " . mysqli_error($conn));
    echo json_encode(['success' => false, 'message' => 'Error fetching users']);
    exit;
}

$users = [];
while ($row = mysqli_fetch_assoc($result)) {
    $users[] = $row;
}

echo json_encode($users);

mysqli_close($conn);
?>