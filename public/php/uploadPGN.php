<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    if (!isset($_FILES['pgn'])) {
        throw new Exception('No file uploaded');
    }

    $file = $_FILES['pgn'];
    $fileName = basename($file['name']);
    $targetDir = "../uploads/pgn/";
    
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    
    $targetPath = $targetDir . time() . '_' . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $stmt = $conn->prepare("
            INSERT INTO pgn_files (teacher_id, title, file_path, upload_date) 
            VALUES (?, ?, ?, NOW())
        ");
        
        $stmt->bind_param("iss", $_SESSION['user_id'], $fileName, $targetPath);
        $stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'File uploaded successfully']);
    } else {
        throw new Exception('Failed to move uploaded file');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
