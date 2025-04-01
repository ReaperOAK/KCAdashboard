<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Notification.php';
require_once '../../middleware/auth.php';

try {
    // Get user_id from token and verify admin role
    $user_id = validateToken();
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if user is admin
    $query = "SELECT role FROM users WHERE id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["message" => "Unauthorized access"]);
        exit();
    }
    
    // Query to get admin-sent notifications with counts
    $query = "SELECT n.title, n.message, n.category, n.type, 
              MIN(n.created_at) as created_at, 
              COALESCE(n.link, '') as link,
              COUNT(*) as recipient_count,
              SUM(CASE WHEN n.email_sent = true THEN 1 ELSE 0 END) > 0 as emails_sent
              FROM notifications n
              WHERE n.type = 'custom' OR n.type IN (
                  SELECT DISTINCT type FROM notifications WHERE type != 'custom'
              )
              GROUP BY n.title, n.message, n.category, n.type, COALESCE(n.link, '')
              ORDER BY MIN(n.created_at) DESC
              LIMIT 50";
              
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        "notifications" => $notifications
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error retrieving admin-sent notifications",
        "error" => $e->getMessage()
    ]);
}
?>
