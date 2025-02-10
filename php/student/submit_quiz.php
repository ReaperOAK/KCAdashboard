<?php
require_once('../config.php');
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$quizId = $data['quizId'];
$answers = $data['answers'];

try {
    // Get correct answers
    $stmt = $conn->prepare("
        SELECT id, correct_answer
        FROM quiz_questions
        WHERE quiz_id = ?
    ");
    $stmt->bind_param("i", $quizId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $correctAnswers = 0;
    $totalQuestions = $result->num_rows;
    
    while ($row = $result->fetch_assoc()) {
        $questionId = $row['id'];
        if (isset($answers[$questionId]) && $answers[$questionId] === $row['correct_answer']) {
            $correctAnswers++;
        }
    }
    
    $score = ($correctAnswers / $totalQuestions) * 100;
    
    // Save the quiz result
    $stmt = $conn->prepare("
        INSERT INTO quiz_results 
        (user_id, quiz_id, score, correct_answers, total_questions) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("iidii", $_SESSION['user_id'], $quizId, $score, $correctAnswers, $totalQuestions);
    $stmt->execute();
    
    echo json_encode([
        'score' => round($score, 2),
        'correctAnswers' => $correctAnswers,
        'totalQuestions' => $totalQuestions
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}

$conn->close();
?>
