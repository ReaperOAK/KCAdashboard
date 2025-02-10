<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$name = $_POST['name'];
$profile_picture = '';

// Handle file upload if present
if (isset($_FILES['profilePicture']) && $_FILES['profilePicture']['error'] === 0) {
    $upload_dir = '../uploads/profiles/';
    $file_extension = pathinfo($_FILES['profilePicture']['name'], PATHINFO_EXTENSION);
    $file_name = $user_id . '_' . time() . '.' . $file_extension;
    $target_path = $upload_dir . $file_name;

    if (move_uploaded_file($_FILES['profilePicture']['tmp_name'], $target_path)) {
        $profile_picture = $file_name;
    }
}

try {
    if ($profile_picture) {
        $stmt = $conn->prepare("UPDATE users SET name = ?, profile_picture = ? WHERE id = ?");
        $stmt->bind_param("ssi", $name, $profile_picture, $user_id);
    } else {
        $stmt = $conn->prepare("UPDATE users SET name = ? WHERE id = ?");
        $stmt->bind_param("si", $name, $user_id);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Personal information updated successfully']);
    } else {
        throw new Exception('Failed to update personal information');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
