<?php
// Basic error handling
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Log requests for debugging
$logFile = __DIR__ . '/../../uploads/upload_log.txt';
file_put_contents($logFile, date('Y-m-d H:i:s') . " - New upload attempt\n", FILE_APPEND);
file_put_contents($logFile, "POST: " . print_r($_POST, true) . "\n", FILE_APPEND);
file_put_contents($logFile, "FILES: " . print_r($_FILES, true) . "\n", FILE_APPEND);
file_put_contents($logFile, "Raw input: " . file_get_contents('php://input') . "\n", FILE_APPEND);

// Include required files
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/PGN.php';
require_once __DIR__ . '/../../middleware/auth.php';

try {
    // Create uploads directory
    $uploadDir = __DIR__ . '/../../uploads/pgn';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Authenticate user
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'teacher') {
        throw new Exception('Unauthorized access');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    $pgn = new PGN($db);
    
    // Check if we have form data
    if (!isset($_POST['data']) || empty($_POST['data'])) {
        throw new Exception('No PGN data provided');
    }
    
    // Decode JSON data
    $jsonData = json_decode($_POST['data'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }
    
    // Validate required fields immediately
    if (empty($jsonData['title'])) {
        throw new Exception('Title is required');
    }
    
    if (empty($jsonData['pgn_content'])) {
        throw new Exception('PGN content is required');
    }
    
    // Handle file upload
    $filePath = null;
    $pgnContent = $jsonData['pgn_content'];
    
    if (isset($_FILES['pgn_file']) && $_FILES['pgn_file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['pgn_file'];
        $filename = uniqid() . '_' . basename($file['name']);
        $targetPath = $uploadDir . '/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $filePath = 'uploads/pgn/' . $filename;
        } else {
            throw new Exception('Failed to upload file');
        }
    }
    
    // Prepare data for database
    $uploadData = [
        'title' => trim($jsonData['title']),
        'description' => isset($jsonData['description']) ? trim($jsonData['description']) : '',
        'category' => isset($jsonData['category']) ? trim($jsonData['category']) : 'opening',
        'pgn_content' => $pgnContent,
        'file_path' => $filePath,
        'is_public' => isset($jsonData['is_public']) ? (bool)$jsonData['is_public'] : false,
        'teacher_id' => $user['id']
    ];
    
    // Upload PGN
    $pgn_id = $pgn->upload($uploadData);
    
    // Success response
    http_response_code(201);
    echo json_encode([
        "message" => "PGN uploaded successfully",
        "id" => $pgn_id
    ]);
    
} catch (Exception $e) {
    file_put_contents($logFile, "ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    
    http_response_code(400);
    echo json_encode([
        "message" => "Error uploading PGN",
        "error" => $e->getMessage()
    ]);
}
?>
