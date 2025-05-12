<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Quiz.php';
require_once '../../middleware/auth.php';

try {
    // Validate token
    $user = getAuthUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "message" => "Unauthorized"
        ]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get overall leaderboard data
    $query = "SELECT 
                u.id as user_id,
                u.full_name as student_name,
                SUM(qa.score) as total_score,
                COUNT(DISTINCT qa.quiz_id) as quizzes_completed,
                ROUND(AVG(qa.score * 100 / (
                    SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = qa.quiz_id
                )), 1) as average_score
              FROM quiz_attempts qa
              JOIN users u ON qa.user_id = u.id
              GROUP BY qa.user_id, u.full_name
              ORDER BY total_score DESC, quizzes_completed DESC, average_score DESC
              LIMIT 20";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        "leaderboard" => $leaderboard
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching overall leaderboard",
        "error" => $e->getMessage()
    ]);
}
?>
