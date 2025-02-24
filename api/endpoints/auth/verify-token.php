<?php
header('Content-Type: application/json');
require_once '../../middleware/auth.php';
require_once '../../config/Database.php';

try {
    $user_id = validateToken();
    
    if (!$user_id) {
        throw new Exception('Invalid token');
    }

    $database = new Database();
    $db = $database->getConnection();

    // Get user details
    $query = "SELECT id, email, role FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('User not found');
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
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
