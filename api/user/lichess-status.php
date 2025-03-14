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
    
    // Check if user has a connected Lichess account
    $query = "SELECT lichess_username, 
                     access_token, 
                     expires_at 
              FROM lichess_integration 
              WHERE user_id = :user_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result && !empty($result['lichess_username']) && !empty($result['access_token'])) {
        // Check if token is expired
        $tokenExpired = false;
        if ($result['expires_at']) {
            $tokenExpired = strtotime($result['expires_at']) < time();
        }
        
        echo json_encode([
            'success' => true,
            'connected' => true,
            'username' => $result['lichess_username'],
            'token_expired' => $tokenExpired
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'connected' => false
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
