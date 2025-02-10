<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $response = [
        'quickLinks' => [
            ['title' => 'Home', 'url' => '/'],
            ['title' => 'About Us', 'url' => '/about'],
            ['title' => 'Contact Us', 'url' => '/contact'],
            ['title' => 'Privacy Policy', 'url' => '/privacy-policy'],
            ['title' => 'Terms of Service', 'url' => '/terms-of-service']
        ],
        'socialMedia' => [
            ['platform' => 'facebook', 'url' => 'https://www.facebook.com'],
            ['platform' => 'twitter', 'url' => 'https://www.twitter.com'],
            ['platform' => 'instagram', 'url' => 'https://www.instagram.com'],
            ['platform' => 'linkedin', 'url' => 'https://www.linkedin.com']
        ],
        'contactInfo' => [
            'email' => 'support@chesscodex.com',
            'phone' => '+1 (123) 456-7890',
            'address' => '123 Chess Codex Lane, Chess City, CC 12345'
        ],
        'aboutText' => 'Chess Codex is your ultimate platform for mastering the game of chess. Join us to learn strategies, connect with like-minded enthusiasts, and improve your skills with expert resources.'
    ];
    
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
