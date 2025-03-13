<?php
header('Content-Type: application/json');
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

// Check if request has form data
if (!isset($_POST['classroom_id']) || !isset($_POST['title']) || !isset($_POST['type'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
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
                'message' => 'Failed to upload file'
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
    
    $stmt->bindParam(':title', $_POST['title']);
    $stmt->bindParam(':description', $_POST['content'] ?? '');
    $stmt->bindParam(':type', $_POST['type']);
    
    // For video, use the content as URL
    if ($_POST['type'] === 'video') {
        $stmt->bindParam(':url', $_POST['content']);
    } else {
        $stmt->bindParam(':url', $file_url);
    }
    
    $stmt->bindParam(':created_by', $user_data['id']);
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
    
    // Create notifications for students
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
    $notif_message = "A new {$_POST['type']} material '{$_POST['title']}' has been added to your classroom.";
    
    $stmt->bindParam(':notif_title', $notif_title);
    $stmt->bindParam(':notif_message', $notif_message);
    $stmt->bindParam(':classroom_id', $_POST['classroom_id']);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Material added successfully',
        'resource_id' => $resource_id
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error adding material: ' . $e->getMessage()
    ]);
}
?>
