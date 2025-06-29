<?php
require_once '../../config/cors.php';
header('Content-Type: application/json');
require_once '../../middleware/auth.php';
require_once '../../config/Database.php';

try {
    $user_id = validateToken();
    $database = new Database();
    $db = $database->getConnection();

    $batch_id = isset($_GET['batch']) ? $_GET['batch'] : 'all';
    $time_period = isset($_GET['period']) ? $_GET['period'] : '30'; // days

    $query = "SELECT 
                u.id,
                u.full_name,
                b.name as batch_name,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
                ROUND(
                    (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END) * 100.0) / 
                    NULLIF(COUNT(*), 0),
                    2
                ) as attendance_percentage
            FROM users u
            JOIN batch_students bs ON u.id = bs.student_id
            JOIN batches b ON bs.batch_id = b.id
            LEFT JOIN batch_sessions s ON b.id = s.batch_id
            LEFT JOIN attendance a ON u.id = a.student_id AND s.id = a.session_id
            WHERE u.role = 'student'
            AND bs.status = 'active'
            AND (:batch_id = 'all' OR b.id = :batch_id)
            AND (s.date_time >= DATE_SUB(CURRENT_DATE, INTERVAL :days DAY) OR s.date_time IS NULL)
            GROUP BY u.id, u.full_name, b.name
            ORDER BY attendance_percentage DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':batch_id', $batch_id);
    $stmt->bindParam(':days', $time_period, PDO::PARAM_INT);
    $stmt->execute();

    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'students' => $students
    ]);

} catch (Exception $e) {
    error_log('Error in get-students-attendance.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch student attendance data',
        'error' => $e->getMessage()
    ]);
}
?>
