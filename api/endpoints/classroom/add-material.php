<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log request data for debugging
error_log("Material upload request received");
error_log("POST data: " . print_r($_POST, true));
error_log("FILES data: " . print_r($_FILES, true));

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

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
    $file_url = null;
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../../uploads/classroom_materials/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate a unique filename
        $filename = uniqid() . '_' . basename($_FILES['file']['name']);
        $target_file = $upload_dir . $filename;
        
        // Move the uploaded file
        if (move_uploaded_file($_FILES['file']['tmp_name'], $target_file)) {
            $file_url = 'uploads/classroom_materials/' . $filename;
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to upload file: ' . error_get_last()['message']
            ]);
            exit;
        }
    }
    
    // Insert into resources table
    $stmt = $db->prepare("
        INSERT INTO resources (
            title, description, type, url, category, created_by, created_at
        ) VALUES (
            :title, :description, :type, :url, 'classroom_material', :created_by, NOW()
        )
    ");
    
    $title = $_POST['title'];
    $description = isset($_POST['content']) ? $_POST['content'] : '';
    $type = $_POST['type'];
    $created_by = $user_data['id'];
    
    // Store URL in a variable first for proper binding
    $url = '';
    if ($type === 'video') {
        $url = isset($_POST['content']) ? $_POST['content'] : '';
    } else {
        $url = $file_url;
    }
    
    $stmt->bindParam(':title', $title);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':type', $type);
    $stmt->bindParam(':url', $url);
    $stmt->bindParam(':created_by', $created_by);
    $stmt->execute();
    
    $resource_id = $db->lastInsertId();
    
    // Now create resource access for all students in this classroom
    $stmt = $db->prepare("
        INSERT INTO resource_access (resource_id, user_id)
        SELECT :resource_id, cs.student_id
        FROM classroom_students cs
        WHERE cs.classroom_id = :classroom_id
    ");
    
    $stmt->bindParam(':resource_id', $resource_id);
    $stmt->bindParam(':classroom_id', $_POST['classroom_id']);
    $stmt->execute();
    
    // Create notifications for students - FIX HERE
    $stmt = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, created_at)
        SELECT 
            cs.student_id,
            :notif_title,
            :notif_message,
            'new_material',
            NOW()
        FROM classroom_students cs
        WHERE cs.classroom_id = :classroom_id
    ");
    
    // Store all values in variables first before binding
    $notif_title = "New Learning Material Available";
    $notif_message = "A new " . $type . " material '" . $title . "' has been added to your classroom.";
    $classroom_id = $_POST['classroom_id']; // Use a variable for classroom_id too
    
    // Now bind the variables, not expressions or literals
    $stmt->bindParam(':notif_title', $notif_title);
    $stmt->bindParam(':notif_message', $notif_message);
    $stmt->bindParam(':classroom_id', $classroom_id);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Material added successfully',
        'resource_id' => $resource_id
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
