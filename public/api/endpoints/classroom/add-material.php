<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../../config/cors.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log request data for debugging
error_log("Material upload request received");
error_log("POST data: " . print_r($_POST, true));
error_log("FILES data: " . print_r($_FILES, true));
error_log("Server request method: " . $_SERVER['REQUEST_METHOD']);

require_once '../../config/Database.php';

require_once '../../middleware/auth.php';
require_once '../../models/Notification.php';
require_once '../../services/NotificationService.php';

// Function to process individual file upload
function processFileUpload($file_field) {
    $upload_dir = '../../../uploads/classroom_materials/';
    
    // Create directory if it doesn't exist
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    // Validate file size (10MB max)
    if ($file_field['size'] > 10 * 1024 * 1024) {
        return [
            'success' => false,
            'error' => 'File size exceeds 10MB limit'
        ];
    }
    
    // Validate file extension for security
    $file_extension = strtolower(pathinfo($file_field['name'], PATHINFO_EXTENSION));
    $allowed_extensions = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mp3', 'wav', 'ppt', 'pptx', 'xls', 'xlsx', 'pgn'];
    
    if (!in_array($file_extension, $allowed_extensions)) {
        return [
            'success' => false,
            'error' => 'File type not allowed. Allowed types: ' . implode(', ', $allowed_extensions)
        ];
    }
    
    // Generate a unique filename
    $filename = uniqid() . '_' . time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($file_field['name']));
    $target_file = $upload_dir . $filename;
    
    // Move the uploaded file
    if (move_uploaded_file($file_field['tmp_name'], $target_file)) {
        return [
            'success' => true,
            'filename' => $filename
        ];
    } else {
        return [
            'success' => false,
            'error' => 'Failed to move uploaded file'
        ];
    }
}

// Verify token and get user
$user_data = verifyToken();

if (!$user_data || $user_data['role'] !== 'teacher') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit;
}

// Check for required fields with detailed error
$missing_fields = [];
if (!isset($_POST['classroom_id'])) $missing_fields[] = 'classroom_id';
if (!isset($_POST['title'])) $missing_fields[] = 'title';
if (!isset($_POST['type'])) $missing_fields[] = 'type';

if (!empty($missing_fields)) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: ' . implode(', ', $missing_fields),
        'debug' => [
            'post_data' => $_POST,
            'files' => isset($_FILES) ? array_keys($_FILES) : 'No files'
        ]
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify teacher owns this classroom
    $stmt = $db->prepare("
        SELECT id FROM classrooms 
        WHERE id = :classroom_id AND teacher_id = :teacher_id
    ");
    
    $stmt->bindParam(':classroom_id', $_POST['classroom_id']);
    $stmt->bindParam(':teacher_id', $user_data['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'You do not have permission to add materials to this classroom'
        ]);
        exit;
    }
      // Handle file upload if present
    $uploaded_files = [];
    $file_urls = [];
    
    // Check for multiple files first (files[])
    if (isset($_FILES['files']) && is_array($_FILES['files']['name'])) {
        $file_count = count($_FILES['files']['name']);
        
        for ($i = 0; $i < $file_count; $i++) {
            if ($_FILES['files']['error'][$i] === UPLOAD_ERR_OK) {
                $file_field = [
                    'name' => $_FILES['files']['name'][$i],
                    'tmp_name' => $_FILES['files']['tmp_name'][$i],
                    'size' => $_FILES['files']['size'][$i],
                    'error' => $_FILES['files']['error'][$i]
                ];
                
                $upload_result = processFileUpload($file_field);
                if ($upload_result['success']) {
                    $uploaded_files[] = $upload_result['filename'];
                    $file_urls[] = $upload_result['filename'];
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Failed to upload file "' . $file_field['name'] . '": ' . $upload_result['error']
                    ]);
                    exit;
                }
            }
        }
    }
    // Check for single file (file) - for backward compatibility
    elseif (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $upload_result = processFileUpload($_FILES['file']);
        if ($upload_result['success']) {
            $uploaded_files[] = $upload_result['filename'];
            $file_urls[] = $upload_result['filename'];
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to upload file: ' . $upload_result['error']
            ]);
            exit;
        }
    }
    
    $title = $_POST['title'];
    $description = isset($_POST['description']) ? $_POST['description'] : '';
    $type = $_POST['type'];
    $created_by = $user_data['id'];
    
    // Handle multiple files and/or content
    $resources_created = [];
    
    // If we have uploaded files, create a resource entry for each file
    if (!empty($file_urls)) {
        foreach ($file_urls as $index => $file_url) {
            $file_title = $title . (count($file_urls) > 1 ? ' (File ' . ($index + 1) . ')' : '');
            
            $stmt = $db->prepare("
                INSERT INTO resources (
                    title, description, type, url, category, created_by, created_at
                ) VALUES (
                    :title, :description, 'file', :url, 'classroom_material', :created_by, NOW()
                )
            ");
            
            $stmt->bindParam(':title', $file_title);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':url', $file_url);
            $stmt->bindParam(':created_by', $created_by);
            
            if (!$stmt->execute()) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to save file resource to database'
                ]);
                exit;
            }
            
            $resource_id = $db->lastInsertId();
            $resources_created[] = $resource_id;
            
            // Create resource access for all students in this classroom
            $stmt = $db->prepare("
                INSERT INTO resource_access (resource_id, user_id)
                SELECT :resource_id, cs.student_id
                FROM classroom_students cs
                WHERE cs.classroom_id = :classroom_id
            ");
            
            $stmt->bindParam(':resource_id', $resource_id);
            $stmt->bindParam(':classroom_id', $_POST['classroom_id']);
            $stmt->execute();
        }
    }
    
    // If we have content/links, create a separate resource entry for video content
    if (isset($_POST['content']) && !empty($_POST['content'])) {
        $content = $_POST['content'];
        
        $stmt = $db->prepare("
            INSERT INTO resources (
                title, description, type, url, category, created_by, created_at
            ) VALUES (
                :title, :description, 'video', :url, 'classroom_material', :created_by, NOW()
            )
        ");
        
        $video_title = $title . (!empty($file_urls) ? ' (Video)' : '');
        $stmt->bindParam(':title', $video_title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':url', $content);
        $stmt->bindParam(':created_by', $created_by);
        
        if (!$stmt->execute()) {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to save video resource to database'
            ]);
            exit;
        }
        
        $resource_id = $db->lastInsertId();
        $resources_created[] = $resource_id;
        
        // Create resource access for all students in this classroom
        $stmt = $db->prepare("
            INSERT INTO resource_access (resource_id, user_id)
            SELECT :resource_id, cs.student_id
            FROM classroom_students cs
            WHERE cs.classroom_id = :classroom_id
        ");
        
        $stmt->bindParam(':resource_id', $resource_id);
        $stmt->bindParam(':classroom_id', $_POST['classroom_id']);
        $stmt->execute();
    }
    
    // Validate that we created at least one resource
    if (empty($resources_created)) {
        echo json_encode([
            'success' => false,
            'message' => 'Please provide either a file upload or content/link'
        ]);
        exit;
    }
    
    // Create notifications for students using NotificationService
    $files_count = count($file_urls);
    $has_content = isset($_POST['content']) && !empty($_POST['content']);
    
    $notif_title = "New Learning Material Available";
    if ($files_count > 1) {
        $notif_message = "New materials have been added to your classroom: '" . $title . "' (" . $files_count . " files" . ($has_content ? " + video link" : "") . ")";
    } else if ($files_count == 1) {
        $notif_message = "A new file '" . $title . "'" . ($has_content ? " and video link have" : " has") . " been added to your classroom.";
    } else {
        $notif_message = "A new video material '" . $title . "' has been added to your classroom.";
    }
    
    $classroom_id = $_POST['classroom_id'];
    $notificationService = new NotificationService();
    
    // Get all student IDs in the classroom
    $studentStmt = $db->prepare("SELECT student_id FROM classroom_students WHERE classroom_id = :classroom_id");
    $studentStmt->bindParam(':classroom_id', $classroom_id);
    $studentStmt->execute();
    $studentIds = $studentStmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!empty($studentIds)) {
        $notificationService->sendBulkCustom($studentIds, $notif_title, $notif_message, 'new_material');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Materials added successfully',
        'resources_created' => count($resources_created),
        'files_uploaded' => $files_count,
        'has_video_content' => $has_content,
        'resource_ids' => $resources_created
    ]);
    
} catch (Exception $e) {
    error_log("Material upload error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error adding material: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
