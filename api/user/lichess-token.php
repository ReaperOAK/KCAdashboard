<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';

try {
    // Authenticate the user
    $user = verifyToken();
    if (!$user) {
        throw new Exception('Authentication required');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Fetch the user's Lichess token
    $query = "SELECT access_token, expires_at 
              FROM lichess_integration 
              WHERE user_id = :user_id 
              AND (expires_at IS NULL OR expires_at > NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result && !empty($result['access_token'])) {
        echo json_encode([
            'success' => true,
            'token' => $result['access_token']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No Lichess token found or token has expired'
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
