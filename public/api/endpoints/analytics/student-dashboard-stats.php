<?php
// Include database and CORS headers
require_once '../../config/cors.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate authentication
    $user_id = validateToken();
    
    if (!$user_id) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit;
    }
    
    // Get user data
    $database = new Database();
    $db = $database->getConnection();
    
    $userQuery = "SELECT role FROM users WHERE id = :user_id";
    $userStmt = $db->prepare($userQuery);
    $userStmt->bindParam(':user_id', $user_id);
    $userStmt->execute();
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userData || $userData['role'] !== 'student') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied. Only students can access this endpoint.'
        ]);
        exit;
    }
      // Get student stats
    $stats = [
        'totalClasses' => 0,
        'attendance' => "0%",
        'gamesPlayed' => 0,
        'gamesWon' => 0,
        'currentRating' => 1200,
        'upcomingClasses' => 0,
        'attendanceRate' => 0,
        'averageQuizScore' => 0,
        'totalQuizzes' => 0,
        'currentStreak' => 0
    ];
    
    // Get total classes attended by the student
    try {
        $classQuery = "SELECT COUNT(DISTINCT bs.id) as total_classes
                      FROM batch_sessions bs
                      INNER JOIN batch_students bst ON bs.batch_id = bst.batch_id
                      WHERE bst.student_id = :student_id
                      AND bs.date_time <= NOW()";
        $classStmt = $db->prepare($classQuery);
        $classStmt->bindParam(':student_id', $user_id);
        $classStmt->execute();
        $classResult = $classStmt->fetch(PDO::FETCH_ASSOC);
        $stats['totalClasses'] = (int)($classResult['total_classes'] ?? 0);
    } catch (Exception $e) {
        error_log("Error fetching total classes: " . $e->getMessage());
    }
      // Get attendance statistics
    try {
        $attendanceQuery = "SELECT 
                              COUNT(*) as total_sessions,
                              SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                              SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count
                            FROM attendance a
                            INNER JOIN batch_sessions bs ON a.session_id = bs.id
                            INNER JOIN batch_students bst ON bs.batch_id = bst.batch_id
                            WHERE a.student_id = :student_id
                            AND bst.student_id = :student_id";
        
        $attendanceStmt = $db->prepare($attendanceQuery);
        $attendanceStmt->bindParam(':student_id', $user_id);
        $attendanceStmt->execute();
        $attendanceResult = $attendanceStmt->fetch(PDO::FETCH_ASSOC);
        
        $totalSessions = (int)($attendanceResult['total_sessions'] ?? 0);
        $presentCount = (int)($attendanceResult['present_count'] ?? 0);
        $lateCount = (int)($attendanceResult['late_count'] ?? 0);
        
        if ($totalSessions > 0) {
            $attendanceRate = round((($presentCount + $lateCount) / $totalSessions) * 100, 1);
            $stats['attendance'] = $attendanceRate . "%";
            $stats['attendanceRate'] = $attendanceRate;
        }
    } catch (Exception $e) {
        error_log("Error fetching attendance: " . $e->getMessage());
        // If attendance table doesn't exist, provide reasonable defaults
        if (strpos($e->getMessage(), 'attendance') !== false || strpos($e->getMessage(), "doesn't exist") !== false) {
            $stats['attendance'] = "0%";
            $stats['attendanceRate'] = 0;
        }
    }
    
    // Get upcoming classes
    try {
        $upcomingQuery = "SELECT COUNT(*) as upcoming_classes
                         FROM batch_sessions bs
                         INNER JOIN batch_students bst ON bs.batch_id = bst.batch_id
                         WHERE bst.student_id = :student_id
                         AND bs.date_time > NOW()";
        
        $upcomingStmt = $db->prepare($upcomingQuery);
        $upcomingStmt->bindParam(':student_id', $user_id);
        $upcomingStmt->execute();
        $upcomingResult = $upcomingStmt->fetch(PDO::FETCH_ASSOC);
        $stats['upcomingClasses'] = (int)($upcomingResult['upcoming_classes'] ?? 0);
    } catch (Exception $e) {
        error_log("Error fetching upcoming classes: " . $e->getMessage());
    }
      // Get quiz statistics
    try {
        $quizQuery = "SELECT 
                        COUNT(*) as total_quizzes,
                        AVG(score) as average_score
                      FROM quiz_attempts 
                      WHERE user_id = :student_id";
        
        $quizStmt = $db->prepare($quizQuery);
        $quizStmt->bindParam(':student_id', $user_id);
        $quizStmt->execute();
        $quizResult = $quizStmt->fetch(PDO::FETCH_ASSOC);
        
        $stats['totalQuizzes'] = (int)($quizResult['total_quizzes'] ?? 0);
        $stats['averageQuizScore'] = round($quizResult['average_score'] ?? 0, 1);
    } catch (Exception $e) {
        error_log("Error fetching quiz stats: " . $e->getMessage());
        // If quiz tables don't exist, provide defaults
        if (strpos($e->getMessage(), 'quiz') !== false || strpos($e->getMessage(), "doesn't exist") !== false) {
            $stats['totalQuizzes'] = 0;
            $stats['averageQuizScore'] = 0;
        }
    }    // Get games played from chess player stats
    try {
        $gamesQuery = "SELECT 
                         COALESCE(games_played, 0) as games_played,
                         COALESCE(games_won, 0) as games_won,
                         COALESCE(rating, 1200) as rating
                       FROM chess_player_stats 
                       WHERE user_id = :student_id";
        
        $gamesStmt = $db->prepare($gamesQuery);
        $gamesStmt->bindParam(':student_id', $user_id);
        $gamesStmt->execute();
        $gamesResult = $gamesStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($gamesResult) {
            $stats['gamesPlayed'] = (int)$gamesResult['games_played'];
            $stats['gamesWon'] = (int)$gamesResult['games_won'];
            $stats['currentRating'] = (int)$gamesResult['rating'];
        } else {
            // If no chess stats exist, try tournament registrations as fallback
            $tournamentQuery = "SELECT COUNT(*) as tournament_games
                              FROM tournament_registrations tr
                              INNER JOIN tournaments t ON tr.tournament_id = t.id
                              WHERE tr.user_id = :student_id
                              AND t.status IN ('completed', 'ongoing')";
            
            $tournamentStmt = $db->prepare($tournamentQuery);
            $tournamentStmt->bindParam(':student_id', $user_id);
            $tournamentStmt->execute();
            $tournamentResult = $tournamentStmt->fetch(PDO::FETCH_ASSOC);
            $stats['gamesPlayed'] = (int)($tournamentResult['tournament_games'] ?? 0);
        }
    } catch (Exception $e) {
        error_log("Error fetching games played: " . $e->getMessage());
        // If chess/tournament tables don't exist, provide defaults
        if (strpos($e->getMessage(), 'chess_player_stats') !== false || 
            strpos($e->getMessage(), 'tournament') !== false ||
            strpos($e->getMessage(), "doesn't exist") !== false) {
            $stats['gamesPlayed'] = 0;
            $stats['gamesWon'] = 0;
            $stats['currentRating'] = 1200;
        }
    }
    
    // Get current attendance streak
    try {
        $streakQuery = "SELECT a.status, bs.date_time
                       FROM attendance a
                       INNER JOIN batch_sessions bs ON a.session_id = bs.id
                       WHERE a.student_id = :student_id
                       ORDER BY bs.date_time DESC
                       LIMIT 10";
        
        $streakStmt = $db->prepare($streakQuery);
        $streakStmt->bindParam(':student_id', $user_id);
        $streakStmt->execute();
        $streakResults = $streakStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $currentStreak = 0;
        foreach ($streakResults as $session) {
            if ($session['status'] === 'present' || $session['status'] === 'late') {
                $currentStreak++;
            } else {
                break;
            }
        }
        $stats['currentStreak'] = $currentStreak;
    } catch (Exception $e) {
        error_log("Error fetching attendance streak: " . $e->getMessage());
    }
    
    // Get recent activities
    $recentActivities = [];
    try {
        $activitiesQuery = "SELECT 
                              'quiz' as activity_type,
                              q.title as title,
                              qa.score as score,
                              qa.completed_at as date_time
                            FROM quiz_attempts qa
                            INNER JOIN quizzes q ON qa.quiz_id = q.id
                            WHERE qa.user_id = :student_id
                            ORDER BY qa.completed_at DESC
                            LIMIT 5";
        
        $activitiesStmt = $db->prepare($activitiesQuery);
        $activitiesStmt->bindParam(':student_id', $user_id);
        $activitiesStmt->execute();
        $recentActivities = $activitiesStmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log("Error fetching recent activities: " . $e->getMessage());
    }
    
    // Format the response
    $response = [
        'success' => true,
        'stats' => $stats,
        'recentActivities' => $recentActivities
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Student Dashboard Stats Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
