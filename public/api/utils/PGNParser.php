<?php
// Minimal PGN move parser for PHP (assumes one main line, no variations)
function parse_pgn_moves($pgn) {
    $moves = [];
    // Remove headers
    $pgn = preg_replace('/\[.*?\]\s*/', '', $pgn);
    // Remove comments and result
    $pgn = preg_replace('/\{.*?\}/', '', $pgn);
    $pgn = preg_replace('/(1-0|0-1|1\/2-1\/2|\*)/', '', $pgn);
    // Remove move numbers
    $pgn = preg_replace('/\d+\.(\.\.)?/', '', $pgn);
    // Split by whitespace
    $tokens = preg_split('/\s+/', trim($pgn));
    foreach ($tokens as $token) {
        $move = trim($token);
        if ($move !== '') {
            $moves[] = $move;
        }
    }
    return $moves;
}
