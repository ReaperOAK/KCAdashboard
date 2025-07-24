<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Get token from request
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No authorization header found']);
        exit;
    }

    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid authorization header format']);
        exit;
    }

    $token = $matches[1];
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Delete the specific token
    $deleteQuery = "DELETE FROM auth_tokens WHERE token = :token";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->bindParam(':token', $token);
    
    if ($deleteStmt->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => 'Logged out successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Failed to logout'
        ]);
    }

} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Logout failed',
        'error' => $e->getMessage()
    ]);
}
?>
