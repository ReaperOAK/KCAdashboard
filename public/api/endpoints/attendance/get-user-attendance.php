
<?php
require_once '../../config/cors.php';
header('Content-Type: application/json');
require_once '../../middleware/auth.php';
require_once '../../config/Database.php';

$user_id = validateToken();
$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $target_user_id = $_GET['user_id'];
        $start_date = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $end_date = $_GET['end_date'] ?? date('Y-m-d');

        $query = "SELECT 
                    a.*,
                    b.name as batch_name,
                    bs.date_time as session_date
                 FROM attendance a
                 JOIN batches b ON a.batch_id = b.id
                 JOIN batch_sessions bs ON a.session_id = bs.id
                 WHERE a.student_id = :user_id
                 AND DATE(bs.date_time) BETWEEN :start_date AND :end_date
                 ORDER BY bs.date_time DESC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            'user_id' => $target_user_id,
            'start_date' => $start_date,
            'end_date' => $end_date
        ]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $results
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>
