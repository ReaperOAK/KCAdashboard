<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate authentication
    $user_id = validateToken();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->action)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Action is required']);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    if ($data->action === 'logout_all_others') {
        // Get current token
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches);
        $currentToken = $matches[1] ?? '';
        
        // Delete all tokens except current one
        $deleteQuery = "DELETE FROM auth_tokens WHERE user_id = :user_id AND token != :current_token";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(':user_id', $user_id);
        $deleteStmt->bindParam(':current_token', $currentToken);
        
        if ($deleteStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'All other sessions logged out successfully',
                'sessions_removed' => $deleteStmt->rowCount()
            ]);
        } else {
            throw new Exception('Failed to logout other sessions');
        }
        
    } elseif ($data->action === 'logout_all') {
        // Delete all tokens for this user
        $deleteQuery = "DELETE FROM auth_tokens WHERE user_id = :user_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(':user_id', $user_id);
        
        if ($deleteStmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'All sessions logged out successfully',
                'sessions_removed' => $deleteStmt->rowCount()
            ]);
        } else {
            throw new Exception('Failed to logout all sessions');
        }
        
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }

} catch (Exception $e) {
    error_log("Session management error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to manage sessions',
        'error' => $e->getMessage()
    ]);
}
?>
