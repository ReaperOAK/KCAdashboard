<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

$email = $data->email;
$currentPassword = $data->currentPassword;
$newPassword = password_hash($data->newPassword, PASSWORD_DEFAULT);

$sql = "SELECT password FROM users WHERE email = '$email'";
$result = mysqli_query($conn, $sql);
$user = mysqli_fetch_assoc($result);

if ($user && password_verify($currentPassword, $user['password'])) {
    $sql = "UPDATE users SET password = '$newPassword' WHERE email = '$email'";
    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating password: ' . mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
}

mysqli_close($conn);
?>