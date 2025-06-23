<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user token
    $user = verifyToken();
    if (!$user || ($user['role'] !== 'admin' && $user['role'] !== 'teacher')) {
        http_response_code(403);
        echo json_encode(["message" => "Access denied. Only admins and teachers can share resources."]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();

    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['resource_id']) || !isset($data['student_id'])) {
        http_response_code(400);
        echo json_encode(["message" => "Resource ID and Student ID are required"]);
        exit();
    }

    $resource_id = $data['resource_id'];
    $student_id = $data['student_id'];

    // Check if resource exists
    $resource_check = "SELECT id FROM resources WHERE id = :resource_id";
    $stmt = $db->prepare($resource_check);
    $stmt->bindParam(":resource_id", $resource_id);
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Resource not found"]);
        exit();
    }

    // Check if student exists and is a student
    $student_check = "SELECT id FROM users WHERE id = :student_id AND role = 'student'";
    $stmt = $db->prepare($student_check);
    $stmt->bindParam(":student_id", $student_id);
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
        http_response_code(404);
        echo json_encode(["message" => "Student not found"]);
        exit();
    }

    // Share resource with student
    $share_query = "INSERT IGNORE INTO student_resource_shares 
                   (student_id, resource_id, shared_by) 
                   VALUES (:student_id, :resource_id, :shared_by)";
    
    $stmt = $db->prepare($share_query);
    $stmt->bindParam(":student_id", $student_id);
    $stmt->bindParam(":resource_id", $resource_id);
    $stmt->bindParam(":shared_by", $user['id']);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "message" => "Resource shared with student successfully",
            "resource_id" => $resource_id,
            "student_id" => $student_id
        ]);
    } else {
        throw new Exception("Failed to share resource with student");
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error sharing resource with student",
        "error" => $e->getMessage()
    ]);
}
?>
