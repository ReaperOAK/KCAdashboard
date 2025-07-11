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
            "message" => "Only teachers can create quizzes"
        ]);
        exit;
    }
    
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['title']) || !isset($data['difficulty']) || !isset($data['time_limit'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "Missing required fields"
        ]);
        exit;
    }
    
    // Set the creator id to the authenticated user
    $data['created_by'] = $user['id'];

    // Default to private unless explicitly public
    $data['is_public'] = isset($data['is_public']) ? (bool)$data['is_public'] : false;

    // Accept batch_ids, classroom_ids, student_ids for sharing (optional)
    $data['batch_ids'] = isset($data['batch_ids']) ? $data['batch_ids'] : [];
    $data['classroom_ids'] = isset($data['classroom_ids']) ? $data['classroom_ids'] : [];
    $data['student_ids'] = isset($data['student_ids']) ? $data['student_ids'] : [];
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);
    
    $quizId = $quiz->create($data);
    
    http_response_code(201);
    echo json_encode([
        "message" => "Quiz created successfully",
        "id" => $quizId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error creating quiz",
        "error" => $e->getMessage()
    ]);
}
?>
