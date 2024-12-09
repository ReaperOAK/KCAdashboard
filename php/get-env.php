<?php
header('Content-Type: application/json');
include 'config.env.php';

echo json_encode([
    'GOOGLE_CLIENT_ID' => getenv('GOOGLE_CLIENT_ID'),
]);
?>