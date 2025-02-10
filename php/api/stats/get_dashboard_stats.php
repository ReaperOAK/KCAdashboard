<?php
require_once '../../config.php';
header('Content-Type: application/json');

$stats = [
    'total_users' => 0,
    'active_classes' => 0,
    'total_resources' => 0
];

// Get total users
$query = "SELECT COUNT(*) as total FROM users WHERE active = 1";
$result = $conn->query($query);
if ($result && $row = $result->fetch_assoc()) {
    $stats['total_users'] = $row['total'];
}

// Get active classes
$query = "SELECT COUNT(*) as total FROM classes WHERE time >= CURRENT_DATE()";
$result = $conn->query($query);
if ($result && $row = $result->fetch_assoc()) {
    $stats['active_classes'] = $row['total'];
}

// Get total resources
$query = "SELECT COUNT(*) as total FROM resources";
$result = $conn->query($query);
if ($result && $row = $result->fetch_assoc()) {
    $stats['total_resources'] = $row['total'];
}

echo json_encode(['success' => true, 'stats' => $stats]);
