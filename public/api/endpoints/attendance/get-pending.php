<?php
// Endpoint: GET /api/endpoints/attendance/get-pending.php
// Returns sessions for the teacher that have ended but attendance is not yet marked
require_once __DIR__ . '/../../models/Classroom.php';
require_once __DIR__ . '/../../config/Database.php';

header('Content-Type: application/json');

if (!isset($_GET['teacher_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing teacher_id']);
    exit;
}
$teacher_id = (int)$_GET['teacher_id'];

$db = (new Database())->getConnection();
$query = "SELECT s.id, s.title, s.date_time, s.duration, b.name as batch_name
          FROM batch_sessions s
          JOIN batches b ON s.batch_id = b.id
          WHERE b.teacher_id = :teacher_id
            AND s.date_time <= NOW()
            AND (s.date_time + INTERVAL s.duration MINUTE) <= NOW()
            AND s.id NOT IN (SELECT session_id FROM attendance WHERE session_id = s.id)
          ORDER BY s.date_time DESC
          LIMIT 50";
$stmt = $db->prepare($query);
$stmt->bindParam(':teacher_id', $teacher_id);
$stmt->execute();
$sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['sessions' => $sessions]);
