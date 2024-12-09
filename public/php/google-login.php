<?php
require 'vendor/autoload.php';
include 'config.php';

use League\OAuth2\Client\Provider\Google;
use Dotenv\Dotenv;

session_start();

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$provider = new Google([
    'clientId'     => $_ENV['GOOGLE_CLIENT_ID'],
    'clientSecret' => $_ENV['GOOGLE_CLIENT_SECRET'],
    'redirectUri'  => 'https://dashboard.kolkatachessacademy.in/php/google-login.php',
]);

$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'];

try {
    $user = $provider->getResourceOwner($provider->getAccessToken('authorization_code', [
        'code' => $token
    ]));
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

    echo json_encode(['success' => true, 'role' => $_SESSION['role']]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to get user details']);
}
?>