<?php
session_start();

// Google OAuth Configuration
$client_id = 'YOUR_GOOGLE_CLIENT_ID';
$redirect_uri = 'https://yourdomain.com/google-callback';

// Generate and store state parameter to prevent CSRF
$state = bin2hex(random_bytes(16));
$_SESSION['oauth_state'] = $state;

// Build Google OAuth URL
$auth_url = 'https://accounts.google.com/o/oauth2/v2/auth';
$scope = 'email profile';

$params = [
    'response_type' => 'code',
    'client_id' => $client_id,
    'redirect_uri' => $redirect_uri,
    'scope' => $scope,
    'state' => $state,
    'prompt' => 'select_account'
];

$auth_url .= '?' . http_build_query($params);

// Redirect to Google
header('Location: ' . $auth_url);
exit;
?>
