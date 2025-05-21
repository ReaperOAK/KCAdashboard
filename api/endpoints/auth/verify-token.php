<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dashboard.kolkatachessacademy.in');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../middleware/auth.php';
require_once '../../config/Database.php';

try {
    $headers = getallheaders();
    error_log('Verify Token Headers: ' . json_encode($headers));
    
    $user_id = validateToken();
    
    if (!$user_id) {
        throw new Exception('Invalid token');
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, email, role FROM users WHERE id = :id AND is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('User not found or inactive');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Token is valid',
        'user' => [
            'id' => $user['id'],
            'role' => $user['role']
        ]
    ]);

} catch (Exception $e) {
    error_log('Token verification failed: ' . $e->getMessage());
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'headers' => getallheaders(),
            'error' => $e->getTraceAsString()
        ]
    ]);
}
?>
