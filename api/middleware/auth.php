<?php
require_once __DIR__ . '/../config/Database.php';

function validateToken() {
    // Get HTTP Authorization Header
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    // Check if token exists
    if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        http_response_code(401);
        echo json_encode(['message' => 'No token provided']);
        exit;
    }

    $token = $matches[1];
    
    try {
        // Connect to database
        $database = new Database();
        $db = $database->getConnection();
        
        // Check if token exists and is valid
        $query = "SELECT user_id, expires_at FROM auth_tokens WHERE token = :token";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid token']);
            exit;
        }
        
        // Check if token has expired
        if (strtotime($result['expires_at']) < time()) {
            // Delete expired token
            $delete_query = "DELETE FROM auth_tokens WHERE token = :token";
            $delete_stmt = $db->prepare($delete_query);
            $delete_stmt->bindParam(':token', $token);
            $delete_stmt->execute();
            
            http_response_code(401);
            echo json_encode(['message' => 'Token has expired']);
            exit;
        }
        
        return $result['user_id'];
        
    } catch (Exception $e) {
        error_log("Auth middleware error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['message' => 'Authentication failed']);
        exit;
    }
}

function getAuthUser() {
    try {
        $user_id = validateToken();
        
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT id, email, full_name, role FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
        
    } catch (Exception $e) {
        error_log("Get auth user error: " . $e->getMessage());
        return null;
    }
}
?>
