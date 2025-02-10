<?php
require_once('../config.php');
header('Content-Type: application/json');

try {
    $query = "SELECT * FROM faqs ORDER BY id DESC";
    $result = $conn->query($query);
    
    $faqs = array();
    while($row = $result->fetch_assoc()) {
        $faqs[] = array(
            'id' => $row['id'],
            'question' => $row['question'],
            'answer' => $row['answer'],
            'category' => $row['category']
        );
    }
    
    echo json_encode(['success' => true, 'data' => $faqs]);
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>
