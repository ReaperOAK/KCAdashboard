<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT, POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../config/Database.php';
require_once '../models/PGN.php';
require_once '../middleware/auth.php';

try {
    // Validate user token and get user data
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'teacher') {
        http_response_code(403);
        echo json_encode(['message' => 'Unauthorized access']);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $pgn = new PGN($db);
    
    // Get request data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (empty($data['id'])) {
        throw new Exception('PGN ID is required');
    }
    
    // Verify that user owns this PGN or has edit permission
    $pgnData = $pgn->getPGNById($data['id'], $user['id']);
    if (!$pgnData) {
        throw new Exception('PGN not found');
    }
    
    if ($pgnData['teacher_id'] != $user['id'] && $pgnData['permission'] !== 'edit') {
        throw new Exception('You do not have permission to edit this PGN');
    }
    
    // If PGN content is being updated, validate it
    if (isset($data['pgn_content'])) {
        $validation = $pgn->validatePGN($data['pgn_content']);
        if (!$validation['valid']) {
            throw new Exception('Invalid PGN: ' . $validation['message']);
        }
    }
    
    // Sanitize input fields
    $updateData = [];
    $fields = ['title', 'description', 'category', 'pgn_content', 'is_public'];
    
    foreach ($fields as $field) {
        if (isset($data[$field])) {
            if ($field === 'pgn_content') {
                $updateData[$field] = $data[$field]; // Already validated
            } else if ($field === 'is_public') {
                $updateData[$field] = (bool)$data[$field];
            } else {
                $updateData[$field] = htmlspecialchars(strip_tags($data[$field]));
            }
        }
    }
    
    // Update PGN
    $result = $pgn->update($data['id'], $updateData);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'PGN updated successfully'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage()
    ]);
}
?>
