<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate token
    $userId = validateToken();
    $user = getAuthUser();

    // Check if user is a teacher
    if ($user['role'] !== 'teacher') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Access denied. Only teachers can access this endpoint."]);
        exit;
    }

    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();

    // Query to get all students assigned to the teacher with their latest feedback
    $query = "SELECT 
                u.id, 
                u.full_name AS name, 
                u.email,
                b.id AS batch_id,
                b.name AS batch_name,
                (SELECT MAX(sf.created_at) FROM student_feedback sf WHERE sf.student_id = u.id AND sf.teacher_id = :teacher_id) AS last_feedback_date,
                (SELECT sf.rating FROM student_feedback sf WHERE sf.student_id = u.id AND sf.teacher_id = :teacher_id ORDER BY sf.created_at DESC LIMIT 1) AS last_rating
            FROM 
                users u
            JOIN 
                batch_students bs ON u.id = bs.student_id
            JOIN 
                batches b ON bs.batch_id = b.id
            WHERE 
                b.teacher_id = :teacher_id
                AND u.role = 'student'
                AND bs.status = 'active'
            GROUP BY
                u.id
            ORDER BY 
                u.full_name ASC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':teacher_id', $userId);
    $stmt->execute();

    $students = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Fetch latest report card for this student
        $reportCardStmt = $db->prepare('SELECT file_name FROM report_cards WHERE student_id = :student_id ORDER BY uploaded_at DESC LIMIT 1');
        $reportCardStmt->bindParam(':student_id', $row['id']);
        $reportCardStmt->execute();
        $reportCard = $reportCardStmt->fetch(PDO::FETCH_ASSOC);
        if ($reportCard && !empty($reportCard['file_name'])) {
            $row['report_card_url'] = '/uploads/report_cards/' . $reportCard['file_name'];
        } else {
            $row['report_card_url'] = null;
        }
        $students[] = $row;
    }

    // Return the list of students
    echo json_encode([
        "success" => true,
        "students" => $students
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
