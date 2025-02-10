<?php
require_once('../config.php');
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT q.id, q.title, q.description, q.time_limit,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count
        FROM quizzes q
        WHERE q.active = 1
        ORDER BY q.created_at DESC
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    
    $quizzes = [];
    while ($row = $result->fetch_assoc()) {
        // Get questions for this quiz
        $questionStmt = $conn->prepare("
            SELECT qq.id, qq.question_text, qq.options
            FROM quiz_questions qq
            WHERE qq.quiz_id = ?
        ");
        $questionStmt->bind_param("i", $row['id']);
        $questionStmt->execute();
        $questionResult = $questionStmt->get_result();
        
        $questions = [];
        while ($question = $questionResult->fetch_assoc()) {
            $questions[] = [
                'id' => $question['id'],
                'text' => $question['question_text'],
                'options' => json_decode($question['options'])
            ];
        }
        
        $quizzes[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'timeLimit' => $row['time_limit'],
            'questions' => $questions
        ];
    }
    
    echo json_encode($quizzes);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}

$conn->close();
?>
