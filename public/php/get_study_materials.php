<?php
require_once 'config.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->prepare("SELECT id, title, type, link, description FROM resources WHERE category = 'study_material' ORDER BY id DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $materials = array();
    while ($row = $result->fetch_assoc()) {
        $materials[] = $row;
    }
    
    echo json_encode(['success' => true, 'materials' => $materials]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
