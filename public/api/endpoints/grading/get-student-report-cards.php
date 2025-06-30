<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate token and get user
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized');
    }

    // Only allow students to view their own report cards, or teachers/admins to view for a student
    $student_id = null;
    if ($user['role'] === 'student') {
        $student_id = $user['id'];
    } elseif ($user['role'] === 'teacher' || $user['role'] === 'admin') {
        if (!isset($_GET['student_id'])) {
            throw new Exception('Missing student_id');
        }
        $student_id = intval($_GET['student_id']);
    } else {
        throw new Exception('Access denied');
    }

    $database = new Database();
    $db = $database->getConnection();
    $stmt = $db->prepare('SELECT id, file_name, uploaded_by, uploaded_at, description FROM report_cards WHERE student_id = :student_id ORDER BY uploaded_at DESC');
    $stmt->bindParam(':student_id', $student_id);
    $stmt->execute();
    $cards = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['url'] = '/uploads/report_cards/' . $row['file_name'];
        $cards[] = $row;
    }
    echo json_encode(['success' => true, 'report_cards' => $cards]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
