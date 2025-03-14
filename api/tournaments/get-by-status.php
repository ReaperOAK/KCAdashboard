<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';

try {
    // Authenticate user
    $user = verifyToken();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }
    
    // Get status param
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    
    if (!in_array($status, ['upcoming', 'ongoing', 'completed', 'cancelled'])) {
        throw new Exception('Invalid status parameter');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get tournaments by status with registration status for this user
    $query = "SELECT 
                t.*,
                u.full_name as organizer,
                CASE WHEN tr.user_id IS NOT NULL THEN true ELSE false END as is_registered,
                tr.payment_status
              FROM 
                tournaments t
              LEFT JOIN 
                users u ON t.created_by = u.id
              LEFT JOIN 
                tournament_registrations tr ON t.id = tr.tournament_id AND tr.user_id = :user_id
              WHERE 
                t.status = :status
              ORDER BY 
                t.date_time ASC";
                
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->bindParam(':status', $status);
    $stmt->execute();
    
    $tournaments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => "Successfully retrieved {$status} tournaments",
        'tournaments' => $tournaments
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
