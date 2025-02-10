<?php
require_once('../config.php');
session_start();

$client_id = 'your_lichess_client_id'; // Get this from Lichess API settings
$redirect_uri = 'https://yourdomain.com/php/game/lichess_callback.php';
$scope = 'challenge:write challenge:read board:play';

// Store state in session to prevent CSRF
$_SESSION['lichess_state'] = bin2hex(random_bytes(16));

$auth_url = "https://lichess.org/oauth?" . http_build_query([
    'response_type' => 'code',
    'client_id' => $client_id,
    'redirect_uri' => $redirect_uri,
    'scope' => $scope,
    'state' => $_SESSION['lichess_state']
]);

header('Location: ' . $auth_url);
