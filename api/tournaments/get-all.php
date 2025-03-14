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
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all tournaments with registration status for this user
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
              ORDER BY 
                t.date_time ASC";
                
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    $tournaments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check for Lichess tournaments if online
    $onlineTournaments = array_filter($tournaments, function($t) {
        return $t['type'] === 'online';
    });
    
    if (!empty($onlineTournaments)) {
        // For online tournaments with Lichess IDs, we could fetch additional details
        // from the Lichess API and merge it with our data
        // This would require implementing Lichess API integration
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Successfully retrieved tournaments',
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
