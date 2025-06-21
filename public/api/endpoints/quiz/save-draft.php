<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Quiz.php';
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
            "message" => "Only teachers can save quiz drafts"
        ]);
        exit;
    }
    
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['title'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "Title is required"
        ]);
        exit;
    }
    
    // Set the creator id to the authenticated user and status to draft
    $data['created_by'] = $user['id'];
    $data['status'] = 'draft';
    
    // Set default values if not provided
    if (!isset($data['difficulty'])) {
        $data['difficulty'] = 'beginner';
    }
    if (!isset($data['time_limit'])) {
        $data['time_limit'] = 15;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);
    
    // Check if this is an update or create
    if (isset($data['id']) && $data['id']) {
        // Update existing draft
        $result = $quiz->update($data['id'], $data, $user['id']);
        
        http_response_code(200);
        echo json_encode([
            "message" => "Draft saved successfully",
            "id" => $data['id']
        ]);
    } else {
        // Create new draft
        $quizId = $quiz->create($data);
        
        http_response_code(201);
        echo json_encode([
            "message" => "Draft saved successfully",
            "id" => $quizId
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error saving draft",
        "error" => $e->getMessage()
    ]);
}
?>
