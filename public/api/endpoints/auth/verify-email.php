<?php
// Endpoint to verify email using token (simple demo, production should store tokens in DB)
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/User.php';
require_once '../../models/EmailVerification.php';
header('Content-Type: application/json');

if (!isset($_GET['token'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing verification token."]);
    exit();
}
$token = $_GET['token'];
$database = new Database();
$db = $database->getConnection();
$ev = new EmailVerification($db);
$row = $ev->findByToken($token);
if (!$row) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid or expired verification token."]);
    exit();
}
if ($row['used_at']) {
    http_response_code(400);
    echo json_encode(["message" => "This verification link has already been used."]);
    exit();
}
if (strtotime($row['expires_at']) < time()) {
    http_response_code(400);
    echo json_encode(["message" => "Verification link has expired."]);
    exit();
}
// Activate user
$user = new User($db);
$user->updateStatus($row['user_id'], 'active');
$ev->markUsed($row['id']);
http_response_code(200);
echo json_encode(["message" => "Email verified successfully. You may now log in."]);
?>
