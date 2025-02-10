<?php
header('Content-Type: application/json');
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? '';
$response = ['valid' => false];

if (empty($token)) {
    echo json_encode($response);
    exit;
}

$stmt = $conn->prepare("SELECT email, expires FROM password_resets WHERE token = ? AND expires > ?");
$currentTime = time();
$stmt->bind_param("si", $token, $currentTime);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $response['valid'] = true;
}

$stmt->close();
echo json_encode($response);
?>
