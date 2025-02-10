<?php
require_once('../config.php');
session_start();

class ChessBoard {
    private $conn;
    private $gameId;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function createNewGame($userId, $gameMode, $timeControl) {
        $startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        
        $stmt = $this->conn->prepare("INSERT INTO chess_games (player1_id, game_mode, time_control, current_position, player1_color, status) VALUES (?, ?, ?, ?, 'white', 'active')");
        $stmt->bind_param("isss", $userId, $gameMode, $timeControl, $startingPosition);
        
        if ($stmt->execute()) {
            return ['gameId' => $stmt->insert_id, 'position' => $startingPosition];
        }
        return false;
    }

    public function makeMove($gameId, $userId, $move) {
        // Validate move and update position
        $stmt = $this->conn->prepare("UPDATE chess_games SET current_position = ?, last_move = ? WHERE id = ? AND (player1_id = ? OR player2_id = ?)");
        $stmt->bind_param("ssiii", $newPosition, $move, $gameId, $userId, $userId);
        return $stmt->execute();
    }

    public function getGameState($gameId) {
        $stmt = $this->conn->prepare("SELECT * FROM chess_games WHERE id = ?");
        $stmt->bind_param("i", $gameId);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $board = new ChessBoard($conn);
    $action = $_POST['action'] ?? '';
    $response = ['success' => false];

    switch ($action) {
        case 'new_game':
            $gameData = $board->createNewGame(
                $_POST['userId'],
                $_POST['gameMode'],
                $_POST['timeControl']
            );
            if ($gameData) {
                $response = ['success' => true, 'data' => $gameData];
            }
            break;

        case 'make_move':
            $success = $board->makeMove(
                $_POST['gameId'],
                $_POST['userId'],
                $_POST['move']
            );
            $response = ['success' => $success];
            break;

        case 'get_state':
            $state = $board->getGameState($_POST['gameId']);
            if ($state) {
                $response = ['success' => true, 'data' => $state];
            }
            break;
    }

    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>
