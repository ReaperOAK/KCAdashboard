<?php
require_once 'Database.php';
require_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Admin credentials
$adminData = [
    'email' => 'admin@kca.com',
    'password' => password_hash('admin123', PASSWORD_DEFAULT),
    'role' => 'admin',
    'full_name' => 'Admin'
];

// Check if admin exists
if (!$user->emailExists($adminData['email'])) {
    $user->email = $adminData['email'];
    $user->password = $adminData['password'];
    $user->role = $adminData['role'];
    $user->full_name = $adminData['full_name'];
    
    if ($user->create()) {
        echo "Admin account created successfully\n";
    }
}
?>
