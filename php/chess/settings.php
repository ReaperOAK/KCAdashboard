<?php
require_once('../config.php');
session_start();

class BoardSettings {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function saveSettings($userId, $settings) {
        $stmt = $this->conn->prepare("INSERT INTO user_preferences (user_id, board_theme, show_coordinates, piece_style) 
            VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
            board_theme = VALUES(board_theme),
            show_coordinates = VALUES(show_coordinates),
            piece_style = VALUES(piece_style)");
            
        $stmt->bind_param("isss", 
            $userId, 
            $settings['boardTheme'],
            $settings['showCoordinates'],
            $settings['pieceStyle']
        );
        
        return $stmt->execute();
    }

    public function getSettings($userId) {
        $stmt = $this->conn->prepare("SELECT board_theme, show_coordinates, piece_style FROM user_preferences WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        
        return $result ?: [
            'boardTheme' => 'blue',
            'showCoordinates' => true,
            'pieceStyle' => 'standard'
        ];
    }
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $settings = new BoardSettings($conn);
    $action = $_POST['action'] ?? '';
    $response = ['success' => false];

    switch ($action) {
        case 'save':
            $success = $settings->saveSettings(
                $_POST['userId'],
                json_decode($_POST['settings'], true)
            );
            $response = ['success' => $success];
            break;

        case 'get':
            $userSettings = $settings->getSettings($_POST['userId']);
            $response = ['success' => true, 'data' => $userSettings];
            break;
    }

    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>
