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
    $created_by = $user_data['id'];
    $title = $_POST['title'];
    $classroom_id = $_POST['classroom_id'];
    $resource_ids = [];

    // Accept multiple video links (content[])
    $links = isset($_POST['content']) ? $_POST['content'] : [];
    if (!is_array($links)) {
        $links = [$links];
    }
    foreach ($links as $link) {
        if (empty($link)) continue;
        $stmt = $db->prepare("
            INSERT INTO resources (
                title, description, type, url, category, created_by, created_at
            ) VALUES (
                :title, :description, 'video', :url, 'classroom_material', :created_by, NOW()
            )
        ");
        $desc = $link;
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $desc);
        $stmt->bindParam(':url', $link);
        $stmt->bindParam(':created_by', $created_by);
        $stmt->execute();
        $resource_id = $db->lastInsertId();
        $resource_ids[] = $resource_id;
    }

    // Accept multiple files
    if (isset($_FILES['files'])) {
        $files = $_FILES['files'];
        $fileCount = is_array($files['name']) ? count($files['name']) : 0;
        $upload_dir = '../../../uploads/classroom_materials/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        for ($i = 0; $i < $fileCount; $i++) {
            if ($files['error'][$i] !== UPLOAD_ERR_OK) continue;
            $filename = uniqid() . '_' . basename($files['name'][$i]);
            $target_file = $upload_dir . $filename;
            if (move_uploaded_file($files['tmp_name'][$i], $target_file)) {
                $stmt = $db->prepare("
                    INSERT INTO resources (
                        title, description, type, url, category, created_by, created_at
                    ) VALUES (
                        :title, :description, 'document', :url, 'classroom_material', :created_by, NOW()
                    )
                ");
                $desc = $files['name'][$i];
                $stmt->bindParam(':title', $title);
                $stmt->bindParam(':description', $desc);
                $stmt->bindParam(':url', $filename);
                $stmt->bindParam(':created_by', $created_by);
                $stmt->execute();
                $resource_id = $db->lastInsertId();
                $resource_ids[] = $resource_id;
            }
        }
    }

    // Grant access and notify for all resources
    foreach ($resource_ids as $resource_id) {
        // Resource access
        $stmt = $db->prepare("
            INSERT INTO resource_access (resource_id, user_id)
            SELECT :resource_id, cs.student_id
            FROM classroom_students cs
            WHERE cs.classroom_id = :classroom_id
        ");
        $stmt->bindParam(':resource_id', $resource_id);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();

        // Notification
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
        $notif_title = "New Learning Material Available";
        $notif_message = "A new " . $type . " material '" . $title . "' has been added to your classroom.";
        $stmt->bindParam(':notif_title', $notif_title);
        $stmt->bindParam(':notif_message', $notif_message);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Material(s) added successfully',
        'resource_ids' => $resource_ids
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
