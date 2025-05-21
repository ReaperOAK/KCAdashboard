<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Resource.php';
require_once '../../middleware/auth.php';

try {
    // Validate user token
    $user = verifyToken();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();
    $resource = new Resource($db);
    
    // Check if file was uploaded without errors
    if(isset($_FILES['file']) && $_FILES['file']['error'] === 0) {
        $file = $_FILES['file'];
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $category = $_POST['category'] ?? '';
        $tags = $_POST['tags'] ?? '';
        $type = $_POST['type'] ?? '';
        $difficulty = $_POST['difficulty'] ?? 'beginner';
        
        // Validate required fields
        if(empty($title) || empty($category) || empty($type)) {
            throw new Exception("Title, category and type are required fields");
        }
        
        // Get file extension
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        // Validate file type based on specified resource type
        $allowed_extensions = [
            'pgn' => ['pgn'],
            'pdf' => ['pdf'],
            'video' => ['mp4', 'webm', 'ogg'],
        ];
        
        if ($type !== 'link' && (!isset($allowed_extensions[$type]) || !in_array($file_ext, $allowed_extensions[$type]))) {
            throw new Exception("Invalid file type for the selected resource type");
        }
        
        // Create uploads directory if it doesn't exist
        $upload_dir = '../../../uploads/resources/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        
        // Generate a unique filename
        $new_filename = uniqid() . '_' . $user['id'] . '.' . $file_ext;
        $upload_path = $upload_dir . $new_filename;
        
        // Move the uploaded file
        if(move_uploaded_file($file['tmp_name'], $upload_path)) {
            // Generate URL for the file
            $file_url = '/uploads/resources/' . $new_filename;
            
            // Generate thumbnail for PDFs or video (placeholder for now)
            $thumbnail_url = null;
            if($type === 'pdf') {
                $thumbnail_url = '/assets/images/pdf-thumbnail.png';
            } else if($type === 'video') {
                $thumbnail_url = '/assets/images/video-thumbnail.png';
            }
            
            // Create resource data
            $resource_data = [
                'title' => $title,
                'description' => $description,
                'type' => $type,
                'url' => $file_url,
                'category' => $category,
                'created_by' => $user['id'],
                'file_size' => $file['size'],
                'thumbnail_url' => $thumbnail_url,
                'tags' => $tags,
                'difficulty' => $difficulty
            ];
            
            // Save to database
            $resource_id = $resource->create($resource_data);
            
            if($resource_id) {
                http_response_code(201);
                echo json_encode([
                    "message" => "Resource uploaded successfully",
                    "resource_id" => $resource_id,
                    "file_url" => $file_url
                ]);
            } else {
                throw new Exception("Failed to save resource to database");
            }
        } else {
            throw new Exception("Failed to upload file");
        }
    } else if (isset($_POST['url']) && $_POST['type'] === 'link') {
        // Handle link resources
        $title = $_POST['title'] ?? '';
        $description = $_POST['description'] ?? '';
        $category = $_POST['category'] ?? '';
        $url = $_POST['url'] ?? '';
        $tags = $_POST['tags'] ?? '';
        $difficulty = $_POST['difficulty'] ?? 'beginner';
        
        // Validate required fields
        if(empty($title) || empty($category) || empty($url)) {
            throw new Exception("Title, category and URL are required fields");
        }
        
        // Create resource data
        $resource_data = [
            'title' => $title,
            'description' => $description,
            'type' => 'link',
            'url' => $url,
            'category' => $category,
            'created_by' => $user['id'],
            'tags' => $tags,
            'difficulty' => $difficulty
        ];
        
        // Save to database
        $resource_id = $resource->create($resource_data);
        
        if($resource_id) {
            http_response_code(201);
            echo json_encode([
                "message" => "Link resource created successfully",
                "resource_id" => $resource_id
            ]);
        } else {
            throw new Exception("Failed to save link resource to database");
        }
    } else {
        throw new Exception("No file uploaded or invalid request");
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error uploading resource",
        "error" => $e->getMessage()
    ]);
}
?>
