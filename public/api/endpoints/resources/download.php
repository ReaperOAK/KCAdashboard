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

    // Get resource ID from request
    $resource_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if($resource_id > 0) {
        // Get resource details
        $resource_data = $resource->getResourceById($resource_id);
        if(!$resource_data) {
            throw new Exception("Resource not found");
        }

        // Check if user is allowed to access this resource
        $isOwner = ($resource_data['created_by'] == $user['id']);
        $isAdmin = (isset($user['role']) && $user['role'] === 'admin');
        $isPublic = ($resource_data['is_public'] ?? 0) == 1;
        $hasAccess = false;

        if ($isOwner || $isAdmin || $isPublic) {
            $hasAccess = true;
        } else {
            // Check if resource is shared with user (student), their batch, or classroom
            $student_id = $user['id'];
            // Check direct share
            $sharedWithStudent = $db->prepare("SELECT 1 FROM student_resource_shares WHERE resource_id = :rid AND student_id = :sid LIMIT 1");
            $sharedWithStudent->execute([':rid' => $resource_id, ':sid' => $student_id]);
            if ($sharedWithStudent->fetch()) {
                $hasAccess = true;
            }
            // Check classroom share
            if (!$hasAccess) {
                $classroomShare = $db->prepare("SELECT 1 FROM classroom_resources cr JOIN classroom_students cs ON cr.classroom_id = cs.classroom_id WHERE cr.resource_id = :rid AND cs.student_id = :sid LIMIT 1");
                $classroomShare->execute([':rid' => $resource_id, ':sid' => $student_id]);
                if ($classroomShare->fetch()) {
                    $hasAccess = true;
                }
            }
            // Check batch share
            if (!$hasAccess) {
                $batchShare = $db->prepare("SELECT 1 FROM batch_resources br JOIN batch_students bs ON br.batch_id = bs.batch_id WHERE br.resource_id = :rid AND bs.student_id = :sid LIMIT 1");
                $batchShare->execute([':rid' => $resource_id, ':sid' => $student_id]);
                if ($batchShare->fetch()) {
                    $hasAccess = true;
                }
            }
        }

        if (!$hasAccess) {
            http_response_code(403);
            echo json_encode(["message" => "Forbidden: You do not have access to this resource."]);
            exit();
        }

        // Increment download counter
        $resource->incrementDownloads($resource_id);
        // Log access
        $resource->logAccess($user['id'], $resource_id);

        // Get file path (use UploadHelper for consistency)
        require_once '../../utils/UploadHelper.php';
        $file_path = \UploadHelper::getServerPath('resources') . $resource_data['url'];
        if(!file_exists($file_path)) {
            throw new Exception("File not found on server");
        }

        // Determine Content-Type for inline viewing if requested
        $viewMode = isset($_GET['view']) && $_GET['view'] == '1';
        $ext = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));
        $mime = 'application/octet-stream';
        if ($viewMode) {
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'])) {
                $mime = 'image/' . ($ext === 'jpg' ? 'jpeg' : $ext);
            } elseif ($ext === 'pdf') {
                $mime = 'application/pdf';
            }
        }
        header('Content-Description: File Transfer');
        header('Content-Type: ' . $mime);
        if ($viewMode && $mime !== 'application/octet-stream') {
            header('Content-Disposition: inline; filename="'.basename($file_path).'"');
        } else {
            header('Content-Disposition: attachment; filename="'.basename($file_path).'"');
        }
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file_path));
        flush();
        readfile($file_path);
        exit;
    } else {
        throw new Exception("Resource ID is required");
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error downloading resource",
        "error" => $e->getMessage()
    ]);
}
?>
