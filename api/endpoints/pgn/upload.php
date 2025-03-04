<?php
// Enable detailed error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Use absolute paths with __DIR__ to ensure correct file inclusion
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/PGN.php';
require_once __DIR__ . '/../../middleware/auth.php';

try {
    // Log incoming request for debugging
    error_log('Received PGN upload request');
    error_log('POST data: ' . print_r($_POST, true));
    error_log('FILES data: ' . print_r($_FILES, true));
    
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../../uploads/pgn';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

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
    
    // Handle different content types
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    error_log('Content-Type: ' . $contentType);
    
    $data = [];
    $pgnContent = '';
    $filePath = null;
    
    if (strpos($contentType, 'multipart/form-data') !== false) {
        // Handle form data with possible file upload
        $data = isset($_POST['data']) ? json_decode($_POST['data'], true) : [];
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data in POST: ' . json_last_error_msg());
        }
        
        // Process file upload if present
        if (isset($_FILES['pgn_file']) && $_FILES['pgn_file']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['pgn_file'];
            $filename = uniqid() . '_' . basename($file['name']);
            $targetPath = $uploadDir . '/' . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // File uploaded successfully, read content
                $pgnContent = file_get_contents($targetPath);
                if ($pgnContent === false) {
                    throw new Exception('Failed to read uploaded file');
                }
                
                $data['pgn_content'] = $pgnContent;
                $filePath = 'uploads/pgn/' . $filename;
                $data['file_path'] = $filePath;
            } else {
                throw new Exception('Failed to upload file: ' . error_get_last()['message']);
            }
        }
    } else if ($contentType === 'application/json') {
        $rawInput = file_get_contents('php://input');
        $data = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data: ' . json_last_error_msg());
        }
    } else {
        throw new Exception('Unsupported content type: ' . $contentType);
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
        'file_path' => $filePath,
        'is_public' => isset($data['is_public']) ? (bool)$data['is_public'] : false,
        'teacher_id' => $user['id']
    ];
    
    // Upload PGN to database
    $pgn_id = $pgn->upload($uploadData);
    if (!$pgn_id) {
        throw new Exception('Failed to save PGN to database');
    }
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'message' => 'PGN uploaded successfully',
        'id' => $pgn_id
    ]);
} catch (Exception $e) {
    error_log("PGN Upload Error: " . $e->getMessage());
    error_log("File: " . $e->getFile() . " Line: " . $e->getLine());
    
    http_response_code(400);
    echo json_encode([
        'message' => 'Error uploading PGN',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
