<?php
// Required headers
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/ChessGame.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get game ID from URL parameter
    $game_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($game_id <= 0) {
        throw new Exception('Invalid game ID');
    }

    // Get current user (but don't fail if not authenticated)
    $current_user = null;
    try {
        $current_user = getAuthUser();
    } catch (Exception $e) {
        // Continue without authentication
    }

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Check game exists and user has access
    $game = new ChessGame($db);
    $game->id = $game_id;
    $gameData = $game->readOne();
    if (!$gameData) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Game not found']);
        exit();
    }

    // Get move history
    $moves = $game->getMoves();

    // Dynamically generate PGN from moves
    function movesToPGN($moves) {
        if (empty($moves)) return '';
        $pgn = '';
        $moveCount = 1;
        foreach ($moves as $i => $move) {
            // White's move
            if ($i % 2 === 0) {
                $pgn .= $moveCount . '. ' . $move['move_san'] . ' ';
            } else { // Black's move
                $pgn .= $move['move_san'] . ' ';
                $moveCount++;
            }
        }
        return trim($pgn);
    }

    $pgn = movesToPGN($moves);

    // Optionally, store PGN in DB (chess_games.pgn column)
    // Only if the column exists
    try {
        $check = $db->query("SHOW COLUMNS FROM chess_games LIKE 'pgn'");
        if ($check && $check->rowCount() > 0) {
            $update = $db->prepare("UPDATE chess_games SET pgn = :pgn WHERE id = :id");
            $update->bindParam(':pgn', $pgn);
            $update->bindParam(':id', $game_id);
            $update->execute();
        }
    } catch (Exception $e) {
        // Ignore if column doesn't exist
    }

    // Add FEN history for frontend replay (optional, but useful)
    $fenHistory = [];
    if (!empty($moves)) {
        $fen = 'startpos';
        $fenList = [];
        // Try both PHPChess and alternative libraries for FEN replay
        try {
            require_once '../../vendor/autoload.php';
            if (class_exists('Chess\Chess')) {
                $chess = new Chess\Chess();
                $fenList[] = $chess->fen();
                foreach ($moves as $move) {
                    $chess->move($move['move_san']);
                    $fenList[] = $chess->fen();
                }
                $fenHistory = $fenList;
            } elseif (class_exists('PhpChess\Game')) {
                $game = new PhpChess\Game();
                $fenList[] = $game->getFen();
                foreach ($moves as $move) {
                    $game->move($move['move_san']);
                    $fenList[] = $game->getFen();
                }
                $fenHistory = $fenList;
            }
        } catch (Exception $e) {
            // If no library, skip FEN history
        }
    }

    echo json_encode(['success' => true, 'moves' => $moves, 'pgn' => $pgn, 'fen_history' => $fenHistory]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to retrieve move history', 'error' => $e->getMessage()]);
}
?>
