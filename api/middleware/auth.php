<?php
require_once __DIR__ . '/../config/Database.php';

function validateToken() {
    // Get HTTP Authorization Header
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($auth_header) || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        throw new Exception('No token provided');
    }

    $token = $matches[1];
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        $query = "SELECT user_id, expires_at FROM auth_tokens WHERE token = :token";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            throw new Exception('Invalid token');
        }
        
        if (strtotime($result['expires_at']) < time()) {
            throw new Exception('Token has expired');
        }
        
        return $result['user_id'];
        
    } catch (Exception $e) {
        throw new Exception('Authentication failed: ' . $e->getMessage());
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
