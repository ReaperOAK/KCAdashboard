<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';

try {
    // Authenticate user
    $user = verifyToken();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }
    
    // Check if request is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Delete the Lichess integration for this user
    $query = "DELETE FROM lichess_integration WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user['id']);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Lichess account disconnected successfully'
        ]);
    } else {
        throw new Exception('Failed to disconnect Lichess account');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
