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
            "message" => "Only teachers can publish quizzes"
        ]);
        exit;
    }
    
    // Get quiz ID from request
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode([
            "message" => "Quiz ID is required"
        ]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    $quiz = new Quiz($db);
    
    // Get the quiz to validate it can be published
    $quizData = $quiz->getById($data['id']);
    
    if (!$quizData) {
        http_response_code(404);
        echo json_encode([
            "message" => "Quiz not found"
        ]);
        exit;
    }
    
    // Check if user owns this quiz
    if ($quizData['created_by'] != $user['id']) {
        http_response_code(403);
        echo json_encode([
            "message" => "You don't have permission to publish this quiz"
        ]);
        exit;
    }
    
    // Validate quiz has at least one question
    if (!isset($quizData['questions']) || count($quizData['questions']) === 0) {
        http_response_code(400);
        echo json_encode([
            "message" => "Quiz must have at least one question to be published"
        ]);
        exit;
    }
    
    // Validate all chess questions have correct moves or PGN data
    foreach ($quizData['questions'] as $question) {
        if ($question['type'] === 'chess') {
            $hasCorrectMoves = !empty($question['correct_moves']);
            $hasPgnData = !empty($question['pgn_data']);
            
            if (!$hasCorrectMoves && !$hasPgnData) {
                http_response_code(400);
                echo json_encode([
                    "message" => "All chess questions must have either correct moves or PGN data defined"
                ]);
                exit;
            }
        } else {
            // Validate multiple choice questions have at least one correct answer
            if (!isset($question['answers']) || count($question['answers']) === 0) {
                http_response_code(400);
                echo json_encode([
                    "message" => "All multiple choice questions must have answers"
                ]);
                exit;
            }
            
            $hasCorrectAnswer = false;
            foreach ($question['answers'] as $answer) {
                if ($answer['is_correct']) {
                    $hasCorrectAnswer = true;
                    break;
                }
            }
            
            if (!$hasCorrectAnswer) {
                http_response_code(400);
                echo json_encode([
                    "message" => "All multiple choice questions must have at least one correct answer"
                ]);
                exit;
            }
        }
    }
    
    // Update quiz status to published
    $updateData = [
        'title' => $quizData['title'],
        'description' => $quizData['description'],
        'difficulty' => $quizData['difficulty'],
        'time_limit' => $quizData['time_limit'],
        'status' => 'published'
    ];
    
    $result = $quiz->update($data['id'], $updateData, $user['id']);
    
    http_response_code(200);
    echo json_encode([
        "message" => "Quiz published successfully",
        "id" => $data['id']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error publishing quiz",
        "error" => $e->getMessage()
    ]);
}
?>
