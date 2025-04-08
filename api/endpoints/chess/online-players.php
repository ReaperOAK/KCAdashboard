<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Get users who have been active in the last 5 minutes
    // Note: This assumes you have a 'last_activity' field in your users table
    // You might need to adjust this based on your actual database schema
    // If you don't track last_activity, you can use users who have a valid token
    
    $timeLimit = date('Y-m-d H:i:s', strtotime('-5 minutes'));
    
    // First method: Check users with recent activity
    $query = "SELECT u.id, u.full_name as name, u.role, 
             CASE WHEN u.last_activity > :time_limit THEN 1 ELSE 0 END as online,
             COALESCE(s.rating, 1200) as rating
             FROM users u
             LEFT JOIN chess_player_stats s ON u.id = s.user_id
             WHERE u.is_active = 1 AND u.id != :current_user_id
             ORDER BY online DESC, u.full_name ASC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':time_limit', $timeLimit);
    $stmt->bindParam(':current_user_id', $user['id']);
    
    // If your database doesn't have last_activity tracking, use this alternative
    if (!$stmt->execute()) {
        // Fallback to get users with valid tokens
        $query = "SELECT u.id, u.full_name as name, u.role, 
                 CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END as online,
                 COALESCE(s.rating, 1200) as rating
                 FROM users u
                 LEFT JOIN auth_tokens t ON u.id = t.user_id AND t.expires_at > NOW()
                 LEFT JOIN chess_player_stats s ON u.id = s.user_id
                 WHERE u.is_active = 1 AND u.id != :current_user_id
                 ORDER BY online DESC, u.full_name ASC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':current_user_id', $user['id']);
        $stmt->execute();
    }
    
    $players = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $players[] = [
            "id" => $row['id'],
            "name" => $row['name'],
            "role" => $row['role'],
            "online" => (bool)$row['online'],
            "rating" => (int)$row['rating']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "players" => $players
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to retrieve online players",
        "error" => $e->getMessage()
    ]);
}
?>
