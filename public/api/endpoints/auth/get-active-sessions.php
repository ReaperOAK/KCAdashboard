<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate authentication
    $user_id = validateToken();
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all active sessions for the user
    $query = "SELECT 
                token,
                created_at,
                expires_at,
                CASE 
                    WHEN created_at = (SELECT MAX(created_at) FROM auth_tokens WHERE user_id = :user_id) 
                    THEN 1 
                    ELSE 0 
                END as is_current
              FROM auth_tokens 
              WHERE user_id = :user_id 
              AND expires_at > NOW()
              ORDER BY created_at DESC";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $sessions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $sessions[] = [
            'token' => substr($row['token'], 0, 8) . '...', // Show only first 8 chars for security
            'created_at' => $row['created_at'],
            'expires_at' => $row['expires_at'],
            'is_current' => (bool)$row['is_current']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'sessions' => $sessions,
        'total_sessions' => count($sessions)
    ]);

} catch (Exception $e) {
    error_log("Get sessions error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve sessions',
        'error' => $e->getMessage()
    ]);
}
?>
