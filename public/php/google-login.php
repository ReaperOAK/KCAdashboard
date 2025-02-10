<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// Google OAuth Configuration
$client_id = 'YOUR_GOOGLE_CLIENT_ID';
$client_secret = 'YOUR_GOOGLE_CLIENT_SECRET';
$redirect_uri = 'https://yourdomain.com/google-callback';

// Get POST data
$postData = json_decode(file_get_contents('php://input'), true);
$code = $postData['code'] ?? null;
$state = $postData['state'] ?? null;

if (!$code || !$state) {
    echo json_encode(['success' => false, 'message' => 'Invalid request parameters']);
    exit;
}

// Verify state to prevent CSRF
if ($state !== $_SESSION['oauth_state']) {
    echo json_encode(['success' => false, 'message' => 'Invalid state parameter']);
    exit;
}

try {
    // Exchange code for access token
    $token_url = 'https://oauth2.googleapis.com/token';
    $token_data = [
        'code' => $code,
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'redirect_uri' => $redirect_uri,
        'grant_type' => 'authorization_code'
    ];

    $ch = curl_init($token_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($token_data));
    curl_setopt($ch, CURLOPT_POST, true);
    
    $response = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new Exception('Failed to get access token');
    }

    $token_response = json_decode($response, true);
    if (!isset($token_response['access_token'])) {
        throw new Exception('Invalid token response');
    }

    // Get user info
    $user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $user_info_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token_response['access_token']
    ]);
    
    $user_info = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        throw new Exception('Failed to get user info');
    }

    $google_user = json_decode($user_info, true);
    
    // Check if user exists in database
    $stmt = $conn->prepare("SELECT id, role, name, email FROM users WHERE email = ?");
    $stmt->bind_param("s", $google_user['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // User exists - login
        $user = $result->fetch_assoc();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['email'] = $user['email'];
        
        echo json_encode([
            'success' => true,
            'role' => $user['role'],
            'name' => $user['name']
        ]);
    } else {
        // New user - registration needed
        echo json_encode([
            'success' => false,
            'message' => 'User not registered. Please sign up first.',
            'email' => $google_user['email']
        ]);
    }

} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Authentication failed. Please try again.'
    ]);
}

$conn->close();
?>
