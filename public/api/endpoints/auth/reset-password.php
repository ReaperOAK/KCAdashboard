<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data || !isset($data->token) || !isset($data->password)) {
        throw new Exception('Missing required fields');
    }

    $database = new Database();
    $db = $database->getConnection();

    // Verify token and get user
    $query = "SELECT user_id, expires_at FROM password_resets 
              WHERE token = :token AND used_at IS NULL
              AND expires_at > NOW()";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $data->token);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        throw new Exception('Invalid or expired reset token');
    }

    // Update password
    $user_id = $result['user_id'];
    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
    
    $query = "UPDATE users SET password = :password WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':id', $user_id);
    
    if ($stmt->execute()) {
        // Mark token as used
        $query = "UPDATE password_resets SET used_at = NOW() WHERE token = :token";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $data->token);
        $stmt->execute();
        
        echo json_encode(["message" => "Password has been reset successfully"]);
    } else {
        throw new Exception('Failed to reset password');
    }

} catch (Exception $e) {
    error_log("Password reset error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Password reset failed",
        "error" => $e->getMessage()
    ]);
}
?>
