<?php
include 'config.php';

$data = json_decode(file_get_contents("php://input"));

$email = $data->email;
$name = $data->name;
$profilePicture = $data->profilePicture; // Assuming this is a URL or base64 string

$sql = "UPDATE users SET name = '$name', profile_picture = '$profilePicture' WHERE email = '$email'";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['success' => true, 'message' => 'Personal information updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating personal information: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>