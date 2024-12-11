<?php
require __DIR__ . '/../vendor/autoload.php';
include 'config.php';
include 'config.env.php'; // Include the environment variables

use Firebase\Auth\Token\Exception\InvalidToken;
use Kreait\Firebase\Factory;

$factory = (new Factory)->withServiceAccount(__DIR__ . '/../path/to/your/firebase-service-account.json');
$auth = $factory->createAuth();

$data = json_decode(file_get_contents('php://input'), true);
$idTokenString = $data['idToken'];

try {
    $verifiedIdToken = $auth->verifyIdToken($idTokenString);
    $uid = $verifiedIdToken->claims()->get('sub');
    $user = $auth->getUser($uid);

    // Extract user information
    $googleId = $user->uid;
    $name = $user->displayName;
    $email = $user->email;
    $profilePicture = $user->photoUrl;

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
} catch (InvalidToken $e) {
    echo json_encode(['success' => false, 'message' => 'The token is invalid: ' . $e->getMessage()]);
} catch (\InvalidArgumentException $e) {
    echo json_encode(['success' => false, 'message' => 'The token could not be parsed: ' . $e->getMessage()]);
}
?>