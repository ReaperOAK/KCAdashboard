<?php

require_once '../../config/cors.php';
require_once '../../config/Database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Get categories with hierarchy
    $query = "SELECT 
                id,
                name,
                description,
                parent_id,
                sort_order,
                is_active,
                (SELECT COUNT(*) FROM pgn_files WHERE category = pc.name) as game_count
              FROM pgn_categories pc 
              WHERE is_active = TRUE 
              ORDER BY sort_order, name";
    
    $result = $db->query($query);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . $db->error);
    }
    
    $categories = [];
    $parent_categories = [];
    $child_categories = [];
    
    while ($row = $result->fetch_assoc()) {
        $category = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'parent_id' => $row['parent_id'] ? (int)$row['parent_id'] : null,
            'sort_order' => (int)$row['sort_order'],
            'game_count' => (int)$row['game_count'],
            'children' => []
        ];
        
        if ($row['parent_id']) {
            $child_categories[$row['parent_id']][] = $category;
        } else {
            $parent_categories[] = $category;
        }
    }
    
    // Build hierarchy
    foreach ($parent_categories as &$parent) {
        if (isset($child_categories[$parent['id']])) {
            $parent['children'] = $child_categories[$parent['id']];
        }
    }
    
    // Also provide flat list for simple dropdowns
    $flat_categories = [];
    $result->data_seek(0); // Reset result pointer
    while ($row = $result->fetch_assoc()) {
        $flat_categories[] = [
            'value' => $row['name'],
            'label' => $row['name'],
            'description' => $row['description'],
            'game_count' => (int)$row['game_count']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'hierarchical' => $parent_categories,
            'flat' => $flat_categories,
            'total_categories' => count($flat_categories)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error fetching categories: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch categories: ' . $e->getMessage(),
        'error_code' => 'CATEGORIES_FETCH_FAILED'
    ]);
}
?>
