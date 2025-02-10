<?php
require_once 'config.php';
header('Content-Type: application/json');

try {
    $query = "SELECT id, icon_class, title, description FROM features WHERE active = 1 ORDER BY display_order";
    $result = $conn->query($query);
    
    $features = [];
    while ($row = $result->fetch_assoc()) {
        $features[] = [
            'id' => $row['id'],
            'icon' => $row['icon_class'],
            'title' => $row['title'],
            'description' => $row['description']
        ];
    }
    
    echo json_encode(['success' => true, 'data' => $features]);
} catch (Exception $e) {
    error_log("Error fetching features: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error fetching features']);
}

$conn->close();
?>
