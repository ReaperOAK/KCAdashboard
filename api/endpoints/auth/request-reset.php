<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../models/User.php';

// Direct includes instead of using autoloader
require_once __DIR__ . '/../../vendor/phpmailer/phpmailer/src/Exception.php';
require_once __DIR__ . '/../../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../../vendor/phpmailer/phpmailer/src/SMTP.php';
require_once __DIR__ . '/../../helpers/Mailer.php';

try {
    // Get request data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data || !isset($data->email)) {
        throw new Exception('Email is required');
    }

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // Check if user exists
    $userData = $user->findByEmail($data->email);
    if (!$userData) {
        // For security, don't reveal if email exists or not
        http_response_code(200);
        echo json_encode(["message" => "If your email exists in our system, you will receive reset instructions"]);
        exit;
    }

    // Generate reset token
    $reset_token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Store reset token in database
    $query = "INSERT INTO password_resets (user_id, token, expires_at) 
              VALUES (:user_id, :token, :expires_at)";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userData['id']);
    $stmt->bindParam(':token', $reset_token);
    $stmt->bindParam(':expires_at', $expires);

    if ($stmt->execute()) {
        try {
            // Send email with reset link
            $mailer = new Mailer();
            $result = $mailer->sendPasswordReset($data->email, $reset_token);
            
            if ($result) {
                http_response_code(200);
                echo json_encode([
                    "message" => "Reset instructions sent successfully"
                ]);
            } else {
                throw new Exception('Email sending failed');
            }
        } catch (Exception $e) {
            error_log("Detailed email error: " . $e->getMessage());
            throw new Exception('Failed to send reset email: ' . $e->getMessage());
        }
    } else {
        throw new Exception('Failed to generate reset token');
    }

} catch (Exception $e) {
    error_log("Password reset request error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Failed to process reset request",
        "error" => $e->getMessage()
    ]);
}
?>
