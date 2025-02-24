<?php
require_once __DIR__ . '/../config/Database.php';

function validateToken() {
    try {
        $headers = getallheaders();
        error_log('Validating token. Headers: ' . json_encode($headers));

        // Case-insensitive header check
        $authHeader = null;
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }

        if (!$authHeader) {
            error_log('No Authorization header found');
            throw new Exception('No token provided');
        }

        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            error_log('Invalid Authorization header format');
            throw new Exception('Invalid token format');
        }

        $token = trim($matches[1]);
        error_log('Token extracted: ' . substr($token, 0, 10) . '...');

        $database = new Database();
        $db = $database->getConnection();
        
        // Check token in database
        $query = "SELECT user_id, expires_at, created_at 
                 FROM auth_tokens 
                 WHERE token = :token";
                 
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            error_log('Token not found in database');
            throw new Exception('Invalid token');
        }

        error_log('Token found. Expires: ' . $result['expires_at'] . ', Created: ' . $result['created_at']);

        if (strtotime($result['expires_at']) < time()) {
            error_log('Token expired at: ' . $result['expires_at']);
            throw new Exception('Token has expired');
        }

        error_log('Token validated successfully for user_id: ' . $result['user_id']);
        return $result['user_id'];
        
    } catch (Exception $e) {
        error_log('Token validation failed: ' . $e->getMessage());
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
