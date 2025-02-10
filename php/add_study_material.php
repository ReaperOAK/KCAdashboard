<?php
require_once 'config.php';
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['title']) || !isset($data['type']) || !isset($data['link'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO resources (category, title, type, link, description) VALUES ('study_material', ?, ?, ?, ?)");
    $stmt->bind_param("ssss", 
        $data['title'],
        $data['type'],
        $data['link'],
        $data['description']
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'material' => [
                'id' => $stmt->insert_id,
                'title' => $data['title'],
                'type' => $data['type'],
                'link' => $data['link'],
                'description' => $data['description']
            ]
        ]);
    } else {
        throw new Exception("Error inserting data");
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
