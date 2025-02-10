<?php
require_once('../config.php');
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$gameId = $input['gameId'] ?? 0;
$move = $input['move'] ?? '';
$newPosition = $input['position'] ?? '';

// Validate the game belongs to the user
$stmt = $conn->prepare("SELECT * FROM chess_games WHERE id = ? AND (player1_id = ? OR player2_id = ?)");
$stmt->bind_param("iii", $gameId, $_SESSION['user_id'], $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Game not found']);
    exit;
}

$game = $result->fetch_assoc();

// Update game position
$stmt = $conn->prepare("UPDATE chess_games SET current_position = ?, last_move = ? WHERE id = ?");
$stmt->bind_param("ssi", $newPosition, $move, $gameId);

if ($stmt->execute()) {
    // If playing against AI, calculate AI move
    if ($game['game_mode'] === 'ai') {
        // Simple AI move calculation (should be replaced with actual chess engine)
        $aiMove = calculateAiMove($newPosition, $game['ai_level']);
        
        echo json_encode([
            'success' => true,
            'aiMove' => $aiMove
        ]);
    } else {
        echo json_encode(['success' => true]);
    }
} else {
    echo json_encode(['error' => 'Failed to update game']);
}

$stmt->close();
$conn->close();

function calculateAiMove($position, $level) {
    // This is a placeholder for actual chess engine logic
    // You would need to implement actual chess move calculation here
    // For now, returns a random legal move
    $possibleMoves = [
        'e2e4', 'd2d4', 'g1f3', 'c2c4',
        'e7e5', 'd7d5', 'g8f6', 'c7c5'
    ];
    return $possibleMoves[array_rand($possibleMoves)];
}
