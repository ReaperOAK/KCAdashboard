<?php
require_once '../../config.php';
header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

$features = [];

switch ($role) {
    case 'student':
        $features = [
            [
                'title' => 'Interactive Board',
                'description' => 'Practice with our interactive chess board',
                'link' => '/interactive-board',
                'icon' => 'chess'
            ],
            [
                'title' => 'Study Material',
                'description' => 'Access your learning resources',
                'link' => '/resources',
                'icon' => 'book'
            ],
            // Add more student features
        ];
        break;
    
    case 'teacher':
        $features = [
            [
                'title' => 'Class Management',
                'description' => 'Manage your classes and students',
                'link' => '/classroom-management',
                'icon' => 'chalkboard'
            ],
            // Add more teacher features
        ];
        break;
    
    case 'admin':
        $features = [
            [
                'title' => 'User Management',
                'description' => 'Manage platform users',
                'link' => '/manage-users',
                'icon' => 'users'
            ],
            // Add more admin features
        ];
        break;
}

echo json_encode(['success' => true, 'features' => $features]);
