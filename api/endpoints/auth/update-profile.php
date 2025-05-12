<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once '../../middleware/auth.php';

try {
    // Verify JWT token
    $user_id = validateToken();
    
    if (!$user_id) {
        throw new Exception('Unauthorized access');
    }

    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    // Get request data
    $data = json_decode(file_get_contents("php://input"));

    if (!$data || !isset($data->full_name) || !isset($data->email)) {
        throw new Exception('Missing required fields');
    }

    // Validate email format
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Check if email exists for other users
    $existingUser = $user->findByEmail($data->email);
    if ($existingUser && $existingUser['id'] != $user_id) {
        throw new Exception('Email already in use by another account');
    }

    // Update user data
    $updateData = [
        'id' => $user_id,
        'full_name' => htmlspecialchars(strip_tags($data->full_name)),
        'email' => $data->email
    ];

    if ($user->updateUser($updateData)) {
        // Get updated user data
        $updatedUser = $user->findByEmail($data->email);
        
        // Return success response with updated user data
        echo json_encode([
            "message" => "Profile updated successfully",
            "user" => [
                "id" => $updatedUser['id'],
                "email" => $updatedUser['email'],
                "full_name" => $updatedUser['full_name'],
                "role" => $updatedUser['role'],
                "profile_picture" => $updatedUser['profile_picture']
            ]
        ]);
    } else {
        throw new Exception('Failed to update profile');
    }

} catch (Exception $e) {
    error_log("Profile update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "message" => "Profile update failed",
        "error" => $e->getMessage()
    ]);
}
?>
