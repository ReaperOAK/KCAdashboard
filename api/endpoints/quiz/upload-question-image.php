<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate token and ensure user is a teacher
    $user = getAuthUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "message" => "Unauthorized"
        ]);
        exit;
    }
    
    if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            "message" => "Access denied"
        ]);
        exit;
    }
    
    // Check if file was uploaded
    if (!isset($_FILES['image']) || !$_FILES['image']['tmp_name']) {
        http_response_code(400);
        echo json_encode([
            "message" => "No image provided"
        ]);
        exit;
    }
    
    // Define allowed file types and size limit (2MB)
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
    $max_size = 2 * 1024 * 1024; // 2MB
    
    // Validate file type and size
    $file_info = getimagesize($_FILES['image']['tmp_name']);
    
    if (!$file_info || !in_array($file_info['mime'], $allowed_types)) {
        http_response_code(400);
        echo json_encode([
            "message" => "Invalid image format. Only JPG, PNG and GIF are allowed."
        ]);
        exit;
    }
    
    if ($_FILES['image']['size'] > $max_size) {
        http_response_code(400);
        echo json_encode([
            "message" => "Image size exceeds 2MB limit."
        ]);
        exit;
    }
    
    // Create uploads directory if it doesn't exist
    $upload_dir = __DIR__ . '/../../uploads/quiz_images/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Generate a unique filename
    $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $filename = uniqid('quiz_img_') . '.' . $file_extension;
    $file_path = $upload_dir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $file_path)) {
        http_response_code(500);
        echo json_encode([
            "message" => "Failed to save image"
        ]);
        exit;
    }
    
    // Create a web-accessible URL for the image
    $base_url = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'
        ? "https://" : "http://";
    $base_url .= $_SERVER['HTTP_HOST'];
    $base_url .= dirname(dirname(dirname($_SERVER['PHP_SELF'])));
    
    $image_url = $base_url . '/uploads/quiz_images/' . $filename;
    
    http_response_code(200);
    echo json_encode([
        "message" => "Image uploaded successfully",
        "image_url" => $image_url
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error uploading image",
        "error" => $e->getMessage()
    ]);
}
?>
