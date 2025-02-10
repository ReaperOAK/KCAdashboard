<?php
header('Content-Type: application/json');
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? '';
$password = $data['password'] ?? '';
$response = ['success' => false, 'message' => ''];

// Validate input
if (empty($token) || empty($password)) {
    $response['message'] = 'Invalid input data';
    echo json_encode($response);
    exit;
}

// Verify password complexity
if (strlen($password) < 8 || 
    !preg_match("/[A-Z]/", $password) || 
    !preg_match("/[a-z]/", $password) || 
    !preg_match("/[0-9]/", $password)) {
    $response['message'] = 'Password does not meet complexity requirements';
    echo json_encode($response);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // Get user email from reset token
    $stmt = $conn->prepare("SELECT email FROM password_resets WHERE token = ? AND expires > ?");
    $currentTime = time();
    $stmt->bind_param("si", $token, $currentTime);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Invalid or expired reset token');
    }

    $row = $result->fetch_assoc();
    $email = $row['email'];
    
    // Update user's password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->bind_param("ss", $hashedPassword, $email);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to update password');
    }

    // Delete used reset token
    $stmt = $conn->prepare("DELETE FROM password_resets WHERE token = ?");
    $stmt->bind_param("s", $token);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to delete reset token');
    }

    // Commit transaction
    $conn->commit();
    
    $response['success'] = true;
    $response['message'] = 'Password reset successful';

} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    $response['message'] = $e->getMessage();
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
}

echo json_encode($response);
?>
