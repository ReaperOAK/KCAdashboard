<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';

try {
    // Authenticate the user
    $user = verifyToken();
    if (!$user) {
        throw new Exception('Authentication required');
    }
    
    // Check if request is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->code)) {
        throw new Exception('Authorization code is required');
    }
    
    // Exchange the code for an access token
    $clientId = 'kca_dashboard'; // Your Lichess OAuth app client ID
    $redirectUri = 'https://dashboard.kolkatachessacademy.in/lichess-callback';
    $codeVerifier = ''; // This should be the same code verifier used to get the auth code
    
    $tokenUrl = 'https://lichess.org/api/token';
    $postFields = [
        'grant_type' => 'authorization_code',
        'code' => $data->code,
        'code_verifier' => $codeVerifier,
        'redirect_uri' => $redirectUri,
        'client_id' => $clientId
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $tokenUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($status !== 200) {
        throw new Exception('Failed to exchange auth code for token: ' . $response);
    }
    
    $tokenData = json_decode($response, true);
    if (!isset($tokenData['access_token'])) {
        throw new Exception('Invalid token response');
    }
    
    // Get user profile from Lichess
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://lichess.org/api/account');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $tokenData['access_token']
    ]);
    
    $profileResponse = curl_exec($ch);
    $profileStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($profileStatus !== 200) {
        throw new Exception('Failed to get Lichess profile: ' . $profileResponse);
    }
    
    $profileData = json_decode($profileResponse, true);
    $lichessUsername = $profileData['username'];
    
    // Save the token and username
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if the user already has a Lichess integration
    $query = "SELECT id FROM lichess_integration WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        // Update existing record
        $query = "UPDATE lichess_integration 
                  SET lichess_username = :username, 
                      access_token = :token, 
                      token_type = :token_type,
                      expires_at = :expires_at,
                      updated_at = NOW()
                  WHERE user_id = :user_id";
    } else {
        // Insert new record
        $query = "INSERT INTO lichess_integration 
                  (user_id, lichess_username, access_token, token_type, expires_at)
                  VALUES 
                  (:user_id, :username, :token, :token_type, :expires_at)";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->bindParam(':username', $lichessUsername);
    $stmt->bindParam(':token', $tokenData['access_token']);
    $stmt->bindParam(':token_type', $tokenData['token_type']);
    
    // Handle token expiry if provided
    if (isset($tokenData['expires_in'])) {
        $expiresAt = date('Y-m-d H:i:s', time() + $tokenData['expires_in']);
        $stmt->bindParam(':expires_at', $expiresAt);
    } else {
        // Lichess tokens don't expire by default
        $stmt->bindParam(':expires_at', null, PDO::PARAM_NULL);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Lichess account connected successfully',
            'username' => $lichessUsername
        ]);
    } else {
        throw new Exception('Failed to save Lichess integration data');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
