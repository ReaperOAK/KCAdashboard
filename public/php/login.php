<?php
header('Content-Type: application/json');
session_start();
require_once 'config.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$password = $data['password'];

try {
    // Prepare SQL statement
    $stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ? AND active = 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password'])) {
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            
            echo json_encode([
                'success' => true,
                'role' => $user['role'],
                'message' => 'Login successful'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid credentials'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'User not found or account inactive'
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during login'
    ]);
}

$conn->close();
