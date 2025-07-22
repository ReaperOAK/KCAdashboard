<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate teacher token
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'teacher') {
        throw new Exception('Unauthorized access');
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    if (!isset($_POST['student_id'])) {
        throw new Exception('Missing student_id');
    }
    $student_id = intval($_POST['student_id']);

    if (!isset($_FILES['report_card']) || $_FILES['report_card']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error');
    }

    $upload_dir = '../../../uploads/report_cards/';
    if (!is_dir($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            throw new Exception('Failed to create upload directory');
        }
    }
    
    // Check if directory is writable
    if (!is_writable($upload_dir)) {
        throw new Exception('Upload directory is not writable');
    }

    $file_info = pathinfo($_FILES['report_card']['name']);
    $file_extension = strtolower($file_info['extension']);
    $allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png'];
    if (!in_array($file_extension, $allowed_extensions)) {
        throw new Exception('Invalid file type. Allowed: PDF, JPG, PNG');
    }

    $unique_filename = 'report_' . $student_id . '_' . uniqid() . '.' . $file_extension;
    $upload_path = $upload_dir . $unique_filename;

    if (!move_uploaded_file($_FILES['report_card']['tmp_name'], $upload_path)) {
        error_log("Failed to move uploaded file. Source: " . $_FILES['report_card']['tmp_name'] . ", Destination: " . $upload_path);
        throw new Exception('Failed to save uploaded file');
    }

    // Save file info in report_cards table
    $database = new Database();
    $db = $database->getConnection();
    $description = isset($_POST['description']) ? trim($_POST['description']) : null;
    $stmt = $db->prepare('INSERT INTO report_cards (student_id, file_name, uploaded_by, description) VALUES (:student_id, :file_name, :uploaded_by, :description)');
    $stmt->bindParam(':student_id', $student_id);
    $stmt->bindParam(':file_name', $unique_filename);
    $stmt->bindParam(':uploaded_by', $user['id']);
    $stmt->bindParam(':description', $description);
    
    if (!$stmt->execute()) {
        error_log("Database insert failed. Student ID: $student_id, File: $unique_filename, Uploaded by: " . $user['id']);
        throw new Exception('Failed to save report card information to database');
    }

    echo json_encode(['success' => true, 'message' => 'Report card uploaded', 'file' => $unique_filename]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
