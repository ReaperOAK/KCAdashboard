<?php
require_once 'config.php';
session_start();

// Check if user is logged in and is a teacher
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$teacher_id = $_SESSION['user_id'];
$response = [];

try {
    // Get next class
    $nextClassQuery = "SELECT c.*, b.name as batch_name 
                      FROM classes c 
                      JOIN batches b ON c.batch_id = b.id 
                      WHERE c.teacher_id = ? 
                      AND c.time > NOW() 
                      ORDER BY c.time ASC 
                      LIMIT 1";
    $stmt = $conn->prepare($nextClassQuery);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['nextClass'] = $result->fetch_assoc();

    // Get attendance pending count
    $pendingQuery = "SELECT COUNT(*) as pending 
                    FROM attendance 
                    WHERE class_id IN (
                        SELECT id FROM classes 
                        WHERE teacher_id = ?
                    ) 
                    AND status = 'pending'";
    $stmt = $conn->prepare($pendingQuery);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $pendingData = $result->fetch_assoc();
    $response['attendancePending'] = $pendingData['pending'];

    // Get batch schedule
    $scheduleQuery = "SELECT b.*, c.time 
                     FROM batches b 
                     JOIN classes c ON b.id = c.batch_id 
                     WHERE c.teacher_id = ? 
                     AND c.time >= CURDATE() 
                     ORDER BY c.time ASC 
                     LIMIT 5";
    $stmt = $conn->prepare($scheduleQuery);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['batchSchedule'] = $result->fetch_all(MYSQLI_ASSOC);

    // Get notifications
    $notifQuery = "SELECT message 
                  FROM notifications 
                  WHERE user_id = ? 
                  ORDER BY created_at DESC 
                  LIMIT 5";
    $stmt = $conn->prepare($notifQuery);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['notifications'] = $result->fetch_all(MYSQLI_ASSOC);

    // Get PGN database entries
    $pgnQuery = "SELECT * FROM resources 
                WHERE category = 'pgn' 
                AND teacher_id = ? 
                ORDER BY id DESC";
    $stmt = $conn->prepare($pgnQuery);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['pgnDatabase'] = $result->fetch_all(MYSQLI_ASSOC);

    // Get student analytics
    $analyticsQuery = "SELECT p.*, u.name 
                      FROM performance p 
                      JOIN users u ON p.student_id = u.id 
                      WHERE u.id IN (
                          SELECT student_id 
                          FROM attendance 
                          WHERE class_id IN (
                              SELECT id 
                              FROM classes 
                              WHERE teacher_id = ?
                          )
                      )";
    $stmt = $conn->prepare($analyticsQuery);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $response['studentAnalytics'] = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
