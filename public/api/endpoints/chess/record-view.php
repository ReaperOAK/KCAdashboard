<?php

require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['pgn_id'])) {
        throw new Exception('Missing required field: pgn_id');
    }
    
    $pgn_id = intval($input['pgn_id']);
    $timestamp = isset($input['timestamp']) ? $input['timestamp'] : date('Y-m-d H:i:s');
    
    // Get current user (optional for analytics)
    $current_user = getAuthUser();
    $user_id = $current_user ? $current_user['id'] : null;
    
    // Get client IP and user agent
    $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    // Connect to database
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Check if PGN exists
    $check_query = "SELECT id FROM pgn_files WHERE id = :pgn_id";
    $check_stmt = $pdo->prepare($check_query);
    $check_stmt->bindParam(':pgn_id', $pgn_id, PDO::PARAM_INT);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() === 0) {
        throw new Exception('PGN not found');
    }
    
    // Record the view with better handling for duplicate views
    $insert_query = "INSERT INTO pgn_views 
                     (pgn_id, user_id, ip_address, user_agent, viewed_at) 
                     VALUES (:pgn_id, :user_id, :ip_address, :user_agent, :viewed_at)
                     ON DUPLICATE KEY UPDATE viewed_at = VALUES(viewed_at)";
    
    $stmt = $pdo->prepare($insert_query);
    if (!$stmt) {
        throw new Exception('Database prepare failed');
    }
    
    $stmt->bindParam(':pgn_id', $pgn_id, PDO::PARAM_INT);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':ip_address', $ip_address, PDO::PARAM_STR);
    $stmt->bindParam(':user_agent', $user_agent, PDO::PARAM_STR);
    $stmt->bindParam(':viewed_at', $timestamp, PDO::PARAM_STR);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to record view');
    }
    
    // Get updated view count (increment view_count in pgn_files table)
    $update_query = "UPDATE pgn_files SET view_count = view_count + 1 WHERE id = :pgn_id";
    $update_stmt = $pdo->prepare($update_query);
    $update_stmt->bindParam(':pgn_id', $pgn_id, PDO::PARAM_INT);
    $update_stmt->execute();
    
    // Get the updated view count
    $count_query = "SELECT view_count FROM pgn_files WHERE id = :pgn_id";
    $count_stmt = $pdo->prepare($count_query);
    $count_stmt->bindParam(':pgn_id', $pgn_id, PDO::PARAM_INT);
    $count_stmt->execute();
    $result = $count_stmt->fetch(PDO::FETCH_ASSOC);
    $view_count = $result ? $result['view_count'] : 1;
    
    echo json_encode([
        'success' => true,
        'message' => 'View recorded successfully',
        'data' => [
            'pgn_id' => $pgn_id,
            'view_count' => $view_count,
            'timestamp' => $timestamp
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Error recording PGN view: " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => 'VIEW_RECORD_FAILED'
    ]);
}
?>
