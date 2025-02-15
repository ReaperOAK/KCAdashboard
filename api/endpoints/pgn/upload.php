<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/PGN.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $pgn = new PGN($db);

    // Get teacher_id from token (implement proper token validation)
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    $teacher_id = 1; // Temporary! Replace with actual teacher_id from token

    // Handle file upload
    $pgnFile = $_FILES['pgn_file'] ?? null;
    $data = json_decode($_POST['data'], true);
    
    if ($pgnFile && $pgnFile['error'] === UPLOAD_ERR_OK) {
        $filePath = '../../uploads/pgn/' . uniqid() . '_' . basename($pgnFile['name']);
        if (!move_uploaded_file($pgnFile['tmp_name'], $filePath)) {
            throw new Exception('Failed to upload file');
        }
        
        // Read PGN content from file
        $pgnContent = file_get_contents($filePath);
    } else {
        $pgnContent = $data['pgn_content'] ?? '';
        $filePath = null;
    }

    $uploadData = [
        'title' => $data['title'],
        'description' => $data['description'],
        'category' => $data['category'],
        'pgn_content' => $pgnContent,
        'file_path' => $filePath,
        'is_public' => $data['is_public'] ? 1 : 0,
        'teacher_id' => $teacher_id
    ];

    if ($pgn->upload($uploadData)) {
        http_response_code(201);
        header('Content-Type: application/json');
        echo json_encode(["message" => "PGN uploaded successfully"]);
    }

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        "message" => "Error uploading PGN",
        "error" => $e->getMessage()
    ]);
}
?>
