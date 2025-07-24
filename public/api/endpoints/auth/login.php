<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);


require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once 'rate_limit.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }
    

    $user = new User($db);
    $data = json_decode(file_get_contents("php://input"));

    // Rate limit by IP
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!rate_limit_check($ip, 'login')) {
        http_response_code(429);
        echo json_encode(["message" => "Too many login attempts. Please try again later."]);
        exit();
    }

    error_log("Login attempt for email: " . $data->email);

    if(!empty($data->email) && !empty($data->password)) {
        $userData = $user->findByEmail($data->email);
        if($userData) {
            // Check user status
            if (!isset($userData['status']) || $userData['status'] !== 'active') {
                error_log("Login blocked: user status is not active");
                http_response_code(403);
                echo json_encode(["message" => "Account is not active. Please verify your email before logging in."]);
                exit();
            }
            error_log("User found, verifying password");
            if(password_verify($data->password, $userData['password'])) {
                $user->id = $userData['id'];
                
                // Load session configuration
                $sessionConfig = include '../../config/session-config.php';
                $userRole = $userData['role'];
                
                // Get session limits for this user role
                $maxSessions = $sessionConfig['role_settings'][$userRole]['max_concurrent_sessions'] ?? 
                              $sessionConfig['max_concurrent_sessions'];
                
                if ($maxSessions > 0) {
                    // Count active sessions
                    $sessionCountQuery = "SELECT COUNT(*) as session_count FROM auth_tokens WHERE user_id = :user_id AND expires_at > NOW()";
                    $sessionStmt = $db->prepare($sessionCountQuery);
                    $sessionStmt->bindParam(':user_id', $userData['id']);
                    $sessionStmt->execute();
                    $sessionCount = $sessionStmt->fetch(PDO::FETCH_ASSOC)['session_count'];
                    
                    if ($sessionCount >= $maxSessions) {
                        if ($sessionConfig['auto_remove_old_sessions']) {
                            // Remove oldest session to make room
                            $removeOldestQuery = "DELETE FROM auth_tokens WHERE user_id = :user_id ORDER BY created_at ASC LIMIT 1";
                            $removeStmt = $db->prepare($removeOldestQuery);
                            $removeStmt->bindParam(':user_id', $userData['id']);
                            $removeStmt->execute();
                            
                            error_log("Removed oldest session for user " . $userData['id'] . " due to session limit");
                        } else {
                            // Reject login if auto-remove is disabled
                            http_response_code(429);
                            echo json_encode([
                                "message" => "Maximum concurrent sessions reached. Please logout from another device first.",
                                "max_sessions" => $maxSessions,
                                "current_sessions" => $sessionCount
                            ]);
                            exit();
                        }
                    }
                }
                
                $token = $user->generateAuthToken();
                
                // Get total active sessions after login
                $activeSessionsQuery = "SELECT COUNT(*) as active_sessions FROM auth_tokens WHERE user_id = :user_id AND expires_at > NOW()";
                $activeStmt = $db->prepare($activeSessionsQuery);
                $activeStmt->bindParam(':user_id', $userData['id']);
                $activeStmt->execute();
                $activeSessions = $activeStmt->fetch(PDO::FETCH_ASSOC)['active_sessions'];
                
                http_response_code(200);
                echo json_encode([
                    "token" => $token,
                    "user" => [
                        "id" => $userData['id'],
                        "email" => $userData['email'],
                        "role" => $userData['role'],
                        "full_name" => $userData['full_name'],
                        "profile_picture" => $userData['profile_picture']
                    ],
                    "session_info" => [
                        "active_sessions" => $activeSessions,
                        "max_allowed" => $maxSessions == 0 ? "unlimited" : $maxSessions,
                        "role_based_limit" => true
                    ]
                ]);
            } else {
                error_log("Password verification failed");
                http_response_code(401);
                echo json_encode(["message" => "Invalid credentials"]);
            }
        } else {
            error_log("User not found");
            http_response_code(401);
            echo json_encode(["message" => "Invalid credentials"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields"]);
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Login failed",
        "error" => $e->getMessage()
    ]);
}
?>
