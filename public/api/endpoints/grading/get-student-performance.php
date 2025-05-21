<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate token
    $userId = validateToken();
    $user = getAuthUser();

    // Check if student ID is provided
    if (!isset($_GET['student_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Student ID is required"]);
        exit;
    }

    $studentId = $_GET['student_id'];
    $timeframe = isset($_GET['timeframe']) ? $_GET['timeframe'] : 'month'; // Default to month

    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();

    // Determine date range based on timeframe
    switch ($timeframe) {
        case 'week':
            $dateClause = "AND sf.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)";
            $groupFormat = "%Y-%m-%d"; // Group by day in the last week
            break;
        case 'month':
            $dateClause = "AND sf.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            $groupFormat = "%Y-%m-%d"; // Group by day in the last month
            break;
        case 'quarter':
            $dateClause = "AND sf.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
            $groupFormat = "%Y-%u"; // Group by week in the last quarter
            break;
        case 'year':
            $dateClause = "AND sf.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
            $groupFormat = "%Y-%m"; // Group by month in the last year
            break;
        default:
            $dateClause = "AND sf.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
            $groupFormat = "%Y-%m-%d";
    }

    // Get feedback trend over time
    $feedbackQuery = "SELECT 
                        DATE_FORMAT(sf.created_at, '" . $groupFormat . "') AS period,
                        AVG(sf.rating) AS avg_rating,
                        COUNT(*) AS feedback_count
                    FROM 
                        student_feedback sf
                    WHERE 
                        sf.student_id = :student_id
                        $dateClause
                    GROUP BY 
                        period
                    ORDER BY 
                        MIN(sf.created_at) ASC";

    $feedbackStmt = $db->prepare($feedbackQuery);
    $feedbackStmt->bindParam(':student_id', $studentId);
    $feedbackStmt->execute();
    
    $feedbackTrend = [];
    while ($row = $feedbackStmt->fetch(PDO::FETCH_ASSOC)) {
        $feedbackTrend[] = $row;
    }

    // Get attendance statistics
    $attendanceQuery = "SELECT 
                            COUNT(*) AS total_sessions,
                            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
                            SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
                            SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_count,
                            SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) AS excused_count
                        FROM 
                            attendance a
                        WHERE 
                            a.student_id = :student_id
                            AND a.created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";

    $attendanceStmt = $db->prepare($attendanceQuery);
    $attendanceStmt->bindParam(':student_id', $studentId);
    $attendanceStmt->execute();
    
    $attendance = $attendanceStmt->fetch(PDO::FETCH_ASSOC);

    // Get quiz performance
    $quizQuery = "SELECT 
                    q.title,
                    q.difficulty,
                    qa.score,
                    qa.completed_at
                FROM 
                    quiz_attempts qa
                JOIN 
                    quizzes q ON qa.quiz_id = q.id
                WHERE 
                    qa.user_id = :student_id
                ORDER BY 
                    qa.completed_at DESC
                LIMIT 10";

    $quizStmt = $db->prepare($quizQuery);
    $quizStmt->bindParam(':student_id', $studentId);
    $quizStmt->execute();
    
    $quizzes = [];
    while ($row = $quizStmt->fetch(PDO::FETCH_ASSOC)) {
        $quizzes[] = $row;
    }

    // Get student information
    $studentQuery = "SELECT full_name, email FROM users WHERE id = :student_id";
    $studentStmt = $db->prepare($studentQuery);
    $studentStmt->bindParam(':student_id', $studentId);
    $studentStmt->execute();
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    // Return compiled performance data
    echo json_encode([
        "success" => true,
        "student" => $student,
        "feedback_trend" => $feedbackTrend,
        "attendance" => $attendance,
        "quizzes" => $quizzes,
        "timeframe" => $timeframe
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
