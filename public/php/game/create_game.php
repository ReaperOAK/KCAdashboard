<?php
require_once('../config.php');
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$gameMode = $input['gameMode'] ?? '';
$timeControl = $input['timeControl'] ?? '10+0';
$color = $input['color'] ?? 'random';
$level = $input['level'] ?? 5;

if ($color === 'random') {
    $color = rand(0, 1) ? 'white' : 'black';
}

$stmt = $conn->prepare("INSERT INTO chess_games (
    player1_id, 
    game_mode, 
    time_control, 
    player1_color, 
    ai_level, 
    status,
    current_position
) VALUES (?, ?, ?, ?, ?, 'active', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')");

$stmt->bind_param("isssi", 
    $_SESSION['user_id'],
    $gameMode,
    $timeControl,
    $color,
    $level
);

if ($stmt->execute()) {
    $gameId = $conn->insert_id;
    echo json_encode([
        'success' => true,
        'gameId' => $gameId,
        'color' => $color,
        'initialPosition' => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    ]);
} else {
    echo json_encode(['error' => 'Failed to create game']);
}

$stmt->close();
$conn->close();
