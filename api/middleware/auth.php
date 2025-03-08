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
        
        // Check token with expiration time buffer (30 minutes)
        $query = "SELECT t.*, u.is_active, 
                 TIMESTAMPDIFF(MINUTE, NOW(), t.expires_at) as minutes_until_expiry
                 FROM auth_tokens t
                 JOIN users u ON t.user_id = u.id
                 WHERE t.token = :token
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

        // If token is valid but expires soon (less than 30 minutes), renew it
        if ($result['minutes_until_expiry'] < 30) {
            $new_expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
            $update_query = "UPDATE auth_tokens 
                           SET expires_at = :new_expiry 
                           WHERE token = :token";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->execute([
                'new_expiry' => $new_expiry,
                'token' => $token
            ]);

            // Add renewed token to response headers
            header('X-Token-Renewed: true');
            header('X-Token-Expires: ' . $new_expiry);
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
