<?php
require_once 'config.php';
session_start();

// Check if user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$student_id = $_SESSION['user_id'];
$response = [];

try {
    // Fetch next class
    $nextClassQuery = "
        SELECT c.subject, c.time, c.link 
        FROM classes c 
        INNER JOIN batches b ON c.batch_id = b.id 
        WHERE c.time > NOW() 
        ORDER BY c.time ASC 
        LIMIT 1
    ";
    $result = $conn->query($nextClassQuery);
    $response['nextClass'] = $result->fetch_assoc() ?: null;

    // Fetch attendance data
    $attendanceQuery = "
        SELECT 
            ROUND(
                (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0) / 
                COUNT(*), 2
            ) as percentage,
            GROUP_CONCAT(status ORDER BY date DESC LIMIT 7) as recent_attendance
        FROM attendance 
        WHERE student_id = ?
    ";
    $stmt = $conn->prepare($attendanceQuery);
    $stmt->bind_param("i", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $attendanceData = $result->fetch_assoc();
    
    $response['attendance'] = [
        'percentage' => $attendanceData['percentage'] ?? 0,
        'calendar' => $attendanceData['recent_attendance'] ? 
            explode(',', $attendanceData['recent_attendance']) : []
    ];

    // Fetch notifications
    $notificationsQuery = "
        SELECT message 
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
    ";
    $stmt = $conn->prepare($notificationsQuery);
    $stmt->bind_param("i", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['notifications'] = [];
    while ($row = $result->fetch_assoc()) {
        $response['notifications'][] = $row['message'];
    }

    // Fetch performance data
    $performanceQuery = "
        SELECT subject, grade 
        FROM performance 
        WHERE student_id = ? 
        ORDER BY id DESC
    ";
    $stmt = $conn->prepare($performanceQuery);
    $stmt->bind_param("i", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['performance'] = [];
    while ($row = $result->fetch_assoc()) {
        $response['performance'][] = $row;
    }

    // Fetch chess studies
    $studiesQuery = "
        SELECT title, description, link as lichessLink 
        FROM resources 
        WHERE category = 'chess_studies' 
        ORDER BY id DESC 
        LIMIT 5
    ";
    $result = $conn->query($studiesQuery);
    $response['chessStudies'] = [];
    while ($row = $result->fetch_assoc()) {
        $response['chessStudies'][] = $row;
    }

    // Fetch upcoming simuls
    $simulsQuery = "
        SELECT 
            sg.title,
            u.name as host,
            sg.start_time as date
        FROM simul_games sg
        INNER JOIN users u ON sg.host_id = u.id
        WHERE sg.status = 'pending' 
        AND sg.start_time > NOW()
        ORDER BY sg.start_time ASC 
        LIMIT 3
    ";
    $result = $conn->query($simulsQuery);
    $response['upcomingSimuls'] = [];
    while ($row = $result->fetch_assoc()) {
        $response['upcomingSimuls'][] = $row;
    }

    // Fetch recent games
    $recentGamesQuery = "
        SELECT 
            cg.id,
            CONCAT(
                (SELECT name FROM users WHERE id = 
                    CASE 
                        WHEN cg.player1_id = ? THEN cg.player2_id 
                        ELSE cg.player1_id 
                    END
                )
            ) as opponent,
            status as result
        FROM chess_games cg
        WHERE (player1_id = ? OR player2_id = ?)
        AND status = 'completed'
        ORDER BY updated_at DESC
        LIMIT 5
    ";
    $stmt = $conn->prepare($recentGamesQuery);
    $stmt->bind_param("iii", $student_id, $student_id, $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['recentGames'] = [];
    while ($row = $result->fetch_assoc()) {
        $row['link'] = "game.php?id=" . $row['id'];
        unset($row['id']);
        $response['recentGames'][] = $row;
    }

    // Fetch tournaments
    $tournamentsQuery = "
        SELECT name, format, DATE_FORMAT(start_time, '%Y-%m-%d') as date 
        FROM tournaments 
        WHERE start_time > NOW() 
        ORDER BY start_time ASC 
        LIMIT 3
    ";
    $result = $conn->query($tournamentsQuery);
    $response['tournaments'] = [];
    while ($row = $result->fetch_assoc()) {
        $response['tournaments'][] = $row;
    }

    // Fetch quizzes
    $quizzesQuery = "
        SELECT title, difficulty 
        FROM quizzes 
        WHERE active = 1 
        AND id NOT IN (
            SELECT quiz_id 
            FROM quiz_results 
            WHERE user_id = ?
        )
        LIMIT 3
    ";
    $stmt = $conn->prepare($quizzesQuery);
    $stmt->bind_param("i", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['quizzes'] = [];
    while ($row = $result->fetch_assoc()) {
        $response['quizzes'][] = $row;
    }

    // Send the response
    header('Content-Type: application/json');
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}

$conn->close();
?>
