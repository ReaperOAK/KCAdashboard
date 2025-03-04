<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Fix file paths
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/PGN.php';
require_once __DIR__ . '/../../middleware/auth.php';

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
    
    // Handle JSON data from request
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    
    if ($contentType === 'application/json') {
        $data = json_decode(file_get_contents('php://input'), true);
    } else if (strpos($contentType, 'multipart/form-data') !== false) {
        // Handle form data with possible file upload
        $data = isset($_POST['data']) ? json_decode($_POST['data'], true) : [];
        
        // Process file upload if present
        if (isset($_FILES['pgn_file']) && $_FILES['pgn_file']['error'] == 0) {
            $file = $_FILES['pgn_file'];
            $uploadDir = '../../uploads/pgn/';
            
            // Create directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $filename = uniqid() . '_' . basename($file['name']);
            $targetPath = $uploadDir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // File uploaded successfully, read content
                $pgn_content = file_get_contents($targetPath);
                $data['pgn_content'] = $pgn_content;
                $data['file_path'] = 'uploads/pgn/' . $filename;
            } else {
                throw new Exception('Failed to upload file');
            }
        }
    } else {
        throw new Exception('Unsupported content type');
    }
    
    // Validate required fields
    if (empty($data['title']) || empty($data['pgn_content'])) {
        throw new Exception('Title and PGN content are required');
    }
    
    // Validate PGN content
    $validation = $pgn->validatePGN($data['pgn_content']);
    if (!$validation['valid']) {
        throw new Exception('Invalid PGN: ' . $validation['message']);
    }
    
    // Sanitize input
    $uploadData = [
        'title' => htmlspecialchars(strip_tags($data['title'])),
        'description' => isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : '',
        'category' => isset($data['category']) ? htmlspecialchars(strip_tags($data['category'])) : 'opening',
        'pgn_content' => $data['pgn_content'], // Already validated
        'file_path' => isset($data['file_path']) ? $data['file_path'] : null,
        'is_public' => isset($data['is_public']) ? (bool)$data['is_public'] : false,
        'teacher_id' => $user['id']
    ];
    
    // Upload PGN to database
    $pgn_id = $pgn->upload($uploadData);
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'message' => 'PGN uploaded successfully',
        'id' => $pgn_id
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'message' => $e->getMessage()
    ]);
}
?>
