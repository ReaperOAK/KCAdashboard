<?php
require_once 'config.php';
header('Content-Type: application/json');

try {
    // Prepare the SQL query
    $sql = "SELECT id, category, title, type, link, description FROM resources WHERE 1";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    // Execute the query
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    // Get the result
    $result = $stmt->get_result();
    $resources = [];
    
    while ($row = $result->fetch_assoc()) {
        // Sanitize the data before sending
        $resource = [
            'id' => (int)$row['id'],
            'category' => htmlspecialchars($row['category']),
            'title' => htmlspecialchars($row['title']),
            'type' => htmlspecialchars($row['type']),
            'link' => htmlspecialchars($row['link']),
            'description' => htmlspecialchars($row['description'])
        ];
        $resources[] = $resource;
    }
    
    echo json_encode([
        'success' => true,
        'resources' => $resources
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch resources: ' . $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>
