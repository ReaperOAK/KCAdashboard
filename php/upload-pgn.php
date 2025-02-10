<?php
require_once 'config.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!isset($_FILES['pgn'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

try {
    $file = $_FILES['pgn'];
    $fileName = basename($file['name']);
    $targetDir = "../uploads/pgn/";
    $targetFile = $targetDir . time() . '_' . $fileName;
    
    // Create directory if it doesn't exist
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    // Check file type
    $fileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
    if ($fileType != "pgn") {
        throw new Exception("Only PGN files are allowed");
    }

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        // Save file info to database
        $query = "INSERT INTO resources (category, title, type, link, description, teacher_id) 
                 VALUES ('pgn', ?, 'pgn', ?, '', ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ssi", $fileName, $targetFile, $_SESSION['user_id']);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            $response = [
                'success' => true,
                'pgn' => [
                    'id' => $stmt->insert_id,
                    'title' => $fileName,
                    'link' => $targetFile
                ]
            ];
            echo json_encode($response);
        } else {
            throw new Exception("Failed to save file information");
        }
    } else {
        throw new Exception("Failed to upload file");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
