<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);

try {
    $stmt = $conn->prepare("INSERT INTO user_preferences (user_id, lichess_username, preferred_time_control, board_theme, piece_set) 
                           VALUES (?, ?, ?, ?, ?) 
                           ON DUPLICATE KEY UPDATE 
                           lichess_username = VALUES(lichess_username),
                           preferred_time_control = VALUES(preferred_time_control),
                           board_theme = VALUES(board_theme),
                           piece_set = VALUES(piece_set)");
    
    $stmt->bind_param("issss", 
        $user_id, 
        $data['lichessUsername'],
        $data['preferredTimeControl'],
        $data['boardTheme'],
        $data['pieceSet']
    );

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Chess settings updated successfully']);
    } else {
        throw new Exception('Failed to update chess settings');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
