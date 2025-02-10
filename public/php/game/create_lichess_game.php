<?php
require_once('../config.php');
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !isset($_SESSION['lichess_token'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$gameMode = $input['gameMode'] ?? '';
$timeControl = $input['timeControl'] ?? '10+0';
$color = $input['color'] ?? 'random';
$level = $input['level'] ?? 5;

// Create game on Lichess
$ch = curl_init('https://lichess.org/api/challenge/ai');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $_SESSION['lichess_token'],
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'level' => $level,
        'clock' => [
            'limit' => explode('+', $timeControl)[0] * 60,
            'increment' => explode('+', $timeControl)[1]
        ],
        'color' => $color
    ])
]);

$response = curl_exec($ch);
$data = json_decode($response, true);

if (isset($data['id'])) {
    // Store game in database
    $stmt = $conn->prepare("INSERT INTO chess_games (user_id, lichess_game_id, game_mode, time_control, color, ai_level) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssi", 
        $_SESSION['user_id'],
        $data['id'],
        $gameMode,
        $timeControl,
        $color,
        $level
    );
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'gameId' => $data['id']
    ]);
} else {
    echo json_encode(['error' => 'Failed to create game on Lichess']);
}
