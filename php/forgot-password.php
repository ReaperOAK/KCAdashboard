<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

$email = $data->email;

$sql = "SELECT * FROM users WHERE email = '$email'";
$result = mysqli_query($conn, $sql);
$user = mysqli_fetch_assoc($result);

if ($user) {
    // Implement password recovery logic here (e.g., send email with reset link)
    echo json_encode(['success' => true, 'message' => 'Password recovery email sent']);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

mysqli_close($conn);
?>