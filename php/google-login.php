<?php
require 'vendor/autoload.php';
include 'config.php';
include 'config.env.php'; // Include the environment variables

use League\OAuth2\Client\Provider\Google;

session_start();

$provider = new Google([
    'clientId'     => getenv('GOOGLE_CLIENT_ID'),
    'clientSecret' => getenv('GOOGLE_CLIENT_SECRET'),
    'redirectUri'  => 'https://dashboard.kolkatachessacademy.in/php/google-login.php', // Ensure this matches the URI in Google Cloud Console
]);

if (!isset($_GET['code'])) {
    $authUrl = $provider->getAuthorizationUrl();
    $_SESSION['oauth2state'] = $provider->getState();
    header('Location: ' . $authUrl);
    exit;
} elseif (empty($_GET['state']) || ($_GET['state'] !== $_SESSION['oauth2state'])) {
    unset($_SESSION['oauth2state']);
    exit('Invalid state');
} else {
    $token = $provider->getAccessToken('authorization_code', [
        'code' => $_GET['code']
    ]);

    try {
        $user = $provider->getResourceOwner($token);
        $googleUserInfo = $user->toArray();

        // Extract user information
        $googleId = $googleUserInfo['id'];
        $name = $googleUserInfo['name'];
        $email = $googleUserInfo['email'];
        $profilePicture = $googleUserInfo['picture'];

        // Check if the user already exists in the database
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user) {
            // User exists, log them in
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
        } else {
            // User does not exist, create a new user
            $role = 'student'; // Default role, you can change this as needed
            $sql = "INSERT INTO users (name, email, profile_picture, role) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssss", $name, $email, $profilePicture, $role);
            $stmt->execute();
            $userId = $stmt->insert_id;

            // Log the user in
            $_SESSION['user_id'] = $userId;
            $_SESSION['role'] = $role;
        }

        // Redirect to the home page
        header('Location: /');
        exit;
    } catch (Exception $e) {
        exit('Failed to get user details');
    }
}
?>