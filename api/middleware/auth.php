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
        error_log('Processing token: ' . substr($token, 0, 10) . '...');

        if (empty($token)) {
            error_log('Empty token received');
            throw new Exception('Empty token provided');
        }

        $database = new Database();
        $db = $database->getConnection();
        
        // Detailed token check query
        $query = "SELECT t.*, u.is_active 
                 FROM auth_tokens t
                 JOIN users u ON t.user_id = u.id
                 WHERE t.token = :token
                 AND t.expires_at > NOW()
                 AND u.is_active = 1";
                 
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            // Check if token exists but is expired
            $checkQuery = "SELECT expires_at FROM auth_tokens WHERE token = :token";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':token', $token);
            $checkStmt->execute();
            $tokenInfo = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($tokenInfo) {
                error_log('Token expired at: ' . $tokenInfo['expires_at']);
                // Delete expired token
                $deleteQuery = "DELETE FROM auth_tokens WHERE token = :token";
                $deleteStmt = $db->prepare($deleteQuery);
                $deleteStmt->bindParam(':token', $token);
                $deleteStmt->execute();
                
                throw new Exception('Token has expired');
            }
            
            error_log('Token not found in database');
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
