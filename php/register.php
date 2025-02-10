<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    // Get and sanitize input data
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];
    $role = filter_var($_POST['role'], FILTER_SANITIZE_STRING);
    $missed_class_notifications = isset($_POST['missed_class_notifications']) ? 1 : 0;
    $assignment_due_notifications = isset($_POST['assignment_due_notifications']) ? 1 : 0;

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        throw new Exception('Email already exists');
    }
    $stmt->close();

    // Handle profile picture upload
    $profile_picture_path = null;
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
        $file_type = $_FILES['profile_picture']['type'];
        
        if (!in_array($file_type, $allowed_types)) {
            throw new Exception('Invalid file type. Only JPEG, PNG and GIF are allowed.');
        }

        $max_size = 5 * 1024 * 1024; // 5MB
        if ($_FILES['profile_picture']['size'] > $max_size) {
            throw new Exception('File size too large. Maximum size is 5MB.');
        }

        $upload_dir = '../uploads/profile_pictures/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $file_extension = pathinfo($_FILES['profile_picture']['name'], PATHINFO_EXTENSION);
        $file_name = uniqid() . '.' . $file_extension;
        $profile_picture_path = 'uploads/profile_pictures/' . $file_name;

        if (!move_uploaded_file($_FILES['profile_picture']['tmp_name'], $upload_dir . $file_name)) {
            throw new Exception('Failed to upload profile picture');
        }
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, profile_picture, missed_class_notifications, assignment_due_notifications) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssii", $name, $email, $hashed_password, $role, $profile_picture_path, $missed_class_notifications, $assignment_due_notifications);
    
    if (!$stmt->execute()) {
        // If profile picture was uploaded but user creation failed, delete the uploaded file
        if ($profile_picture_path && file_exists('../' . $profile_picture_path)) {
            unlink('../' . $profile_picture_path);
        }
        throw new Exception('Failed to create user: ' . $stmt->error);
    }

    $user_id = $stmt->insert_id;
    $stmt->close();

    // Create notification for new user
    $welcome_message = "Welcome to the Chess Academy Dashboard! We're excited to have you join us.";
    $stmt = $conn->prepare("INSERT INTO notifications (user_id, role, message) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $user_id, $role, $welcome_message);
    $stmt->execute();
    $stmt->close();

    // Send welcome email
    $to = $email;
    $subject = "Welcome to Chess Academy Dashboard";
    $message = "Dear $name,\n\nWelcome to Chess Academy Dashboard! Your account has been successfully created.\n\nBest regards,\nChess Academy Team";
    $headers = "From: noreply@chessacademy.com";

    mail($to, $subject, $message, $headers);

    echo json_encode([
        'success' => true,
        'message' => 'Registration successful'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
