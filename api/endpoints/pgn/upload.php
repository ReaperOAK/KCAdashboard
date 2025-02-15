<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/PGN.php';

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

    $database = new Database();
    $db = $database->getConnection();
    $pgn = new PGN($db);

    // Get teacher_id from token (implement proper token validation)
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    $teacher_id = 1; // Temporary! Replace with actual teacher_id from token

    // Parse the JSON data
    $jsonData = json_decode($_POST['data'] ?? '{}', true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON data: ' . json_last_error_msg());
    }

    // Handle file upload
    $pgnFile = $_FILES['pgn_file'] ?? null;
    $filePath = null;
    $pgnContent = $jsonData['pgn_content'] ?? '';

    if ($pgnFile && $pgnFile['error'] === UPLOAD_ERR_OK) {
        $filePath = $uploadDir . '/' . uniqid() . '_' . basename($pgnFile['name']);
        if (!move_uploaded_file($pgnFile['tmp_name'], $filePath)) {
            throw new Exception('Failed to upload file: ' . error_get_last()['message']);
        }
        
        // Read PGN content from file
        $pgnContent = file_get_contents($filePath);
        if ($pgnContent === false) {
            throw new Exception('Failed to read uploaded file');
        }
    }

    $uploadData = [
        'title' => $jsonData['title'] ?? '',
        'description' => $jsonData['description'] ?? '',
        'category' => $jsonData['category'] ?? 'opening',
        'pgn_content' => $pgnContent,
        'file_path' => $filePath,
        'is_public' => isset($jsonData['is_public']) ? 1 : 0,
        'teacher_id' => $teacher_id
    ];

    // Validate required fields
    if (empty($uploadData['title']) || empty($uploadData['pgn_content'])) {
        throw new Exception('Title and PGN content are required');
    }

    if ($pgn->upload($uploadData)) {
        http_response_code(201);
        header('Content-Type: application/json');
        echo json_encode([
            "message" => "PGN uploaded successfully",
            "data" => $uploadData
        ]);
    } else {
        throw new Exception('Failed to save PGN to database');
    }

} catch (Exception $e) {
    error_log("PGN Upload Error: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error uploading PGN",
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ]);
}
?>
