<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Verify JWT token
    $user_id = validateToken();
    
    if (!$user_id) {
        throw new Exception('Unauthorized access');
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Check if files were uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error occurred');
    }

    $file = $_FILES['file'];
    $document_type = $_POST['document_type'] ?? 'other';
    
    // Validate document type
    $allowed_types = ['profile_picture', 'dob_certificate', 'id_proof', 'other'];
    if (!in_array($document_type, $allowed_types)) {
        throw new Exception('Invalid document type');
    }

    // Validate file size (10MB max)
    $max_size = 10 * 1024 * 1024; // 10MB
    if ($file['size'] > $max_size) {
        throw new Exception('File too large. Maximum size is 10MB');
    }

    // Validate file type based on document type
    $allowed_extensions = [];
    $allowed_mime_types = [];
    
    if ($document_type === 'profile_picture') {
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $allowed_mime_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    } else {
        // For certificates and other documents
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
        $allowed_mime_types = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    }

    $file_extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($file_extension, $allowed_extensions)) {
        throw new Exception('Invalid file type. Allowed types: ' . implode(', ', $allowed_extensions));
    }

    if (!in_array($file['tmp_name'] ? mime_content_type($file['tmp_name']) : $file['type'], $allowed_mime_types)) {
        throw new Exception('Invalid file format');
    }

    // Create upload directory if it doesn't exist
    $upload_dir = '../../uploads/user_documents/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Generate unique filename
    $unique_filename = uniqid() . '_' . $user_id . '_' . time() . '.' . $file_extension;
    $file_path = $upload_dir . $unique_filename;
    $relative_path = 'uploads/user_documents/' . $unique_filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $file_path)) {
        throw new Exception('Failed to save uploaded file');
    }

    // Start transaction
    $db->beginTransaction();

    try {
        // If this is a profile picture, mark previous ones as inactive
        if ($document_type === 'profile_picture') {
            $stmt = $db->prepare("
                UPDATE user_documents 
                SET is_verified = FALSE 
                WHERE user_id = ? AND document_type = 'profile_picture'
            ");
            $stmt->execute([$user_id]);
        }

        // Insert document record
        $stmt = $db->prepare("
            INSERT INTO user_documents (user_id, document_type, file_name, file_path, file_size, mime_type) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $user_id,
            $document_type,
            $file['name'],
            $relative_path,
            $file['size'],
            mime_content_type($file_path)
        ]);

        $document_id = $db->lastInsertId();

        // Update users table with the file path if it's a profile picture
        if ($document_type === 'profile_picture') {
            $stmt = $db->prepare("
                UPDATE users 
                SET profile_picture_url = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$relative_path, $user_id]);
        }

        // For students, DOB certificate is mandatory, so mark it as requiring verification
        if ($document_type === 'dob_certificate') {
            $stmt = $db->prepare("
                UPDATE users 
                SET dob_certificate_url = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$relative_path, $user_id]);
        }

        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => 'File uploaded successfully',
            'document_id' => $document_id,
            'file_path' => $relative_path,
            'document_type' => $document_type
        ]);

    } catch (Exception $e) {
        $db->rollBack();
        // Clean up uploaded file if database operation failed
        if (file_exists($file_path)) {
            unlink($file_path);
        }
        throw $e;
    }

} catch (Exception $e) {
    error_log("File upload error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
