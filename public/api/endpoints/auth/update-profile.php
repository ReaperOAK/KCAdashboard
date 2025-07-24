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

    // Validate FIDE ID if provided
    if (isset($data->fide_id) && !empty($data->fide_id)) {
        if (!preg_match('/^[0-9]{5,10}$/', $data->fide_id)) {
            throw new Exception('FIDE ID must be 5-10 digits');
        }
        
        // Check if FIDE ID is already in use
        $stmt = $db->prepare("SELECT id FROM users WHERE fide_id = ? AND id != ?");
        $stmt->execute([$data->fide_id, $user_id]);
        if ($stmt->fetch()) {
            throw new Exception('FIDE ID already in use by another account');
        }
    }

    // Validate date of birth if provided
    if (isset($data->date_of_birth) && !empty($data->date_of_birth)) {
        $dob = DateTime::createFromFormat('Y-m-d', $data->date_of_birth);
        if (!$dob || $dob->format('Y-m-d') !== $data->date_of_birth) {
            throw new Exception('Invalid date of birth format. Use YYYY-MM-DD');
        }
        
        // Check if age is reasonable (between 3 and 100 years)
        $age = (new DateTime())->diff($dob)->y;
        if ($age < 3 || $age > 100) {
            throw new Exception('Invalid date of birth. Age must be between 3 and 100 years');
        }
    }

    // Validate ratings if provided
    if (isset($data->fide_rating) && !empty($data->fide_rating)) {
        if (!is_numeric($data->fide_rating) || $data->fide_rating < 0 || $data->fide_rating > 3500) {
            throw new Exception('FIDE rating must be between 0 and 3500');
        }
    }

    if (isset($data->national_rating) && !empty($data->national_rating)) {
        if (!is_numeric($data->national_rating) || $data->national_rating < 0 || $data->national_rating > 3500) {
            throw new Exception('National rating must be between 0 and 3500');
        }
    }

    // Prepare update data with enhanced fields
    $updateFields = [
        'full_name' => htmlspecialchars(strip_tags($data->full_name)),
        'email' => $data->email,
        'fide_id' => isset($data->fide_id) ? $data->fide_id : null,
        'fide_rating' => isset($data->fide_rating) ? (int)$data->fide_rating : null,
        'national_rating' => isset($data->national_rating) ? (int)$data->national_rating : null,
        'date_of_birth' => isset($data->date_of_birth) ? $data->date_of_birth : null,
        'phone_number' => isset($data->phone_number) ? htmlspecialchars(strip_tags($data->phone_number)) : null,
        'bio' => isset($data->bio) ? htmlspecialchars(strip_tags($data->bio)) : null,
        'achievements' => isset($data->achievements) ? htmlspecialchars(strip_tags($data->achievements)) : null,
        'specializations' => isset($data->specializations) ? json_encode($data->specializations) : null,
        'experience_years' => isset($data->experience_years) ? (int)$data->experience_years : null,
        'coaching_since' => isset($data->coaching_since) ? $data->coaching_since : null,
        'address' => isset($data->address) ? htmlspecialchars(strip_tags($data->address)) : null,
        'emergency_contact_name' => isset($data->emergency_contact_name) ? htmlspecialchars(strip_tags($data->emergency_contact_name)) : null,
        'emergency_contact_phone' => isset($data->emergency_contact_phone) ? htmlspecialchars(strip_tags($data->emergency_contact_phone)) : null
    ];

    // Build dynamic SQL query
    $fieldsToUpdate = [];
    $values = [];
    
    foreach ($updateFields as $field => $value) {
        if ($value !== null || in_array($field, ['full_name', 'email'])) { // Always update required fields
            $fieldsToUpdate[] = "$field = ?";
            $values[] = $value;
        }
    }
    
    $sql = "UPDATE users SET " . implode(', ', $fieldsToUpdate) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    $values[] = $user_id;
    
    $stmt = $db->prepare($sql);
    
    if ($stmt->execute($values)) {
        // Get updated user data with all profile fields
        $stmt = $db->prepare("
            SELECT id, email, full_name, role, profile_picture_url, fide_id, fide_rating, 
                   national_rating, date_of_birth, phone_number, bio, achievements, 
                   specializations, experience_years, coaching_since, address,
                   emergency_contact_name, emergency_contact_phone, dob_certificate_url
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$user_id]);
        $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Parse specializations JSON if exists
        if ($updatedUser['specializations']) {
            $updatedUser['specializations'] = json_decode($updatedUser['specializations'], true);
        }
        
        // Return success response with updated user data
        echo json_encode([
            "success" => true,
            "message" => "Profile updated successfully",
            "user" => $updatedUser
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
