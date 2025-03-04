<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/PGN.php';
require_once __DIR__ . '/../../middleware/auth.php';

try {
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../../uploads/pgn';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Log incoming request
    error_log('Received upload request');
    error_log('POST data: ' . print_r($_POST, true));
    error_log('FILES data: ' . print_r($_FILES, true));

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

    // Parse the JSON data from the 'data' field
    $jsonData = json_decode($_POST['data'] ?? '{}', true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    // Handle file upload
    $pgnFile = $_FILES['pgn_file'] ?? null;
    $filePath = null;
    $pgnContent = $jsonData['pgn_content'] ?? '';

    if ($pgnFile && $pgnFile['error'] === UPLOAD_ERR_OK) {
        $filename = uniqid() . '_' . basename($pgnFile['name']);
        $filePath = 'uploads/pgn/' . $filename;
        $fullPath = $uploadDir . '/' . $filename;
        
        if (!move_uploaded_file($pgnFile['tmp_name'], $fullPath)) {
            throw new Exception('Failed to upload file: ' . error_get_last()['message']);
        }
        
        // Read PGN content from file
        $pgnContent = file_get_contents($fullPath);
        if ($pgnContent === false) {
            throw new Exception('Failed to read uploaded file');
        }
    }

    $uploadData = [
        'title' => htmlspecialchars(strip_tags($jsonData['title'])),
        'description' => isset($jsonData['description']) ? htmlspecialchars(strip_tags($jsonData['description'])) : '',
        'category' => isset($jsonData['category']) ? htmlspecialchars(strip_tags($jsonData['category'])) : 'opening',
        'pgn_content' => $pgnContent,
        'file_path' => $filePath,
        'is_public' => isset($jsonData['is_public']) ? (bool)$jsonData['is_public'] : false,
        'teacher_id' => $user['id']
    ];

    // Validate required fields
    if (empty($uploadData['title']) || empty($uploadData['pgn_content'])) {
        throw new Exception('Title and PGN content are required');
    }

    // Upload PGN to database
    $pgn_id = $pgn->upload($uploadData);
    if (!$pgn_id) {
        throw new Exception('Failed to save PGN to database');
    }

    http_response_code(201);
    echo json_encode([
        "message" => "PGN uploaded successfully",
        "id" => $pgn_id
    ]);

} catch (Exception $e) {
    error_log("PGN Upload Error: " . $e->getMessage());
    error_log("File: " . $e->getFile() . " Line: " . $e->getLine());
    
    http_response_code(400);
    echo json_encode([
        "message" => "Error uploading PGN",
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]);
}
?>
