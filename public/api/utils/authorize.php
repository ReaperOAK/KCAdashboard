<?php
// Include the auth middleware
require_once __DIR__ . '/../middleware/auth.php';

/**
 * Authorize a user based on their role
 * 
 * @param array $allowedRoles Array of roles that are permitted to access the resource
 * @return array Returns the user information if authorized
 * @throws Exception if the user is not authorized
 */
function authorize(array $allowedRoles = []) {
    try {
        // Validate the token and get user information
        $user = getAuthUser();
        
        if (!$user) {
            throw new Exception("Authentication required");
        }
        
        // If no specific roles are required, or if the user's role is in the allowed roles
        if (empty($allowedRoles) || in_array($user['role'], $allowedRoles)) {
            return $user;
        }
        
        throw new Exception("Access denied. Required role: " . implode(', ', $allowedRoles));
        
    } catch (Exception $e) {
        // Log auth error
        error_log("Authorization error: " . $e->getMessage());
        throw new Exception($e->getMessage());
    }
}
?>
