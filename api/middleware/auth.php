<?php
require_once __DIR__ . '/../config/Database.php';

function validateToken() {
    try {
        // Get HTTP Authorization Header
        $headers = getallheaders();
        if (!$headers) {
            throw new Exception('No headers found');
        }

        // Case-insensitive header check
        $authHeader = null;
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }

        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            throw new Exception('No token provided');
        }

        $token = trim($matches[1]);
        if (empty($token)) {
            throw new Exception('Empty token provided');
        }

        $database = new Database();
        $db = $database->getConnection();
        
        // Check if token exists and is valid
        $query = "SELECT user_id, expires_at 
                 FROM auth_tokens 
                 WHERE token = :token 
                 AND expires_at > CURRENT_TIMESTAMP";
                 
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            // Log the token details for debugging
            error_log("Token validation failed. Token: " . substr($token, 0, 10) . "...");
            
            // Check if token exists but is expired
            $check_query = "SELECT expires_at FROM auth_tokens WHERE token = :token";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->bindParam(':token', $token);
            $check_stmt->execute();
            $check_result = $check_stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($check_result) {
                error_log("Token found but expired. Expiry: " . $check_result['expires_at']);
                throw new Exception('Token has expired');
            }
            
            // Delete expired token
            $delete_query = "DELETE FROM auth_tokens WHERE token = :token";
            $delete_stmt = $db->prepare($delete_query);
            $delete_stmt->bindParam(':token', $token);
            $delete_stmt->execute();
            
            throw new Exception('Invalid token');
        }
        
        return $result['user_id'];
        
    } catch (Exception $e) {
        error_log('Token validation error: ' . $e->getMessage());
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
