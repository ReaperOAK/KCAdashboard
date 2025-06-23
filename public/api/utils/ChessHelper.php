<?php
/**
 * Chess Helper Utility Class
 * Provides various helper functions for chess functionality
 */
class ChessHelper {
    // Board representation constants
    const BOARD_SIZE = 8;
    const PIECE_SYMBOLS = [
        'K' => '♔', 'Q' => '♕', 'R' => '♖', 'B' => '♗', 'N' => '♘', 'P' => '♙',
        'k' => '♚', 'q' => '♛', 'r' => '♜', 'b' => '♝', 'n' => '♞', 'p' => '♟'
    ];
      // Folder for storing generated thumbnails
    const THUMBNAIL_DIR = '../../../uploads/chess/thumbnails/';
    
    /**
     * Generate a thumbnail image for a chess position
     * 
     * @param string $fen The FEN string of the position
     * @return string|null The URL of the generated thumbnail or null on failure
     */
    public static function generatePositionThumbnail($fen) {
        // Ensure the thumbnail directory exists
        if (!file_exists(self::THUMBNAIL_DIR)) {
            mkdir(self::THUMBNAIL_DIR, 0777, true);
        }
        
        // Generate a unique filename based on the FEN string
        $filename = hash('md5', $fen) . '.png';
        $filepath = self::THUMBNAIL_DIR . $filename;
          // Check if this thumbnail already exists
        if (file_exists($filepath)) {
            return str_replace('../../../', '/', $filepath);
        }
        
        // Try to generate a thumbnail using GD library
        try {
            // Parse the FEN
            $board = self::parseFEN($fen);
            if (!$board) {
                return null;
            }
            
            // Create image
            $img_size = 300; // 300x300 px
            $square_size = $img_size / self::BOARD_SIZE;
            $img = imagecreatetruecolor($img_size, $img_size);
            
            // Define colors
            $white = imagecolorallocate($img, 240, 240, 240);
            $black = imagecolorallocate($img, 110, 110, 110);
            $text_color = imagecolorallocate($img, 0, 0, 0);
            
            // Draw the board
            for ($row = 0; $row < self::BOARD_SIZE; $row++) {
                for ($col = 0; $col < self::BOARD_SIZE; $col++) {
                    $square_color = ($row + $col) % 2 === 0 ? $white : $black;
                    imagefilledrectangle(
                        $img,
                        $col * $square_size,
                        $row * $square_size,
                        ($col + 1) * $square_size,
                        ($row + 1) * $square_size,
                        $square_color
                    );
                    
                    // Draw pieces if any
                    if (!empty($board[$row][$col])) {
                        $piece = $board[$row][$col];
                        $symbol = self::PIECE_SYMBOLS[$piece] ?? '?';
                        
                        // Calculate text position
                        $font_size = $square_size * 0.7;
                        $x = $col * $square_size + ($square_size / 2) - ($font_size / 4);
                        $y = $row * $square_size + ($square_size / 2) + ($font_size / 4);
                        
                        // Use a GD font (not ideal but simple)
                        imagestring($img, 5, $x, $y, $symbol, $text_color);
                    }
                }
            }
            
            // Save the image
            imagepng($img, $filepath);
            imagedestroy($img);
            
            // Return the URL of the thumbnail
            return str_replace('../../', '/', $filepath);
            
        } catch (Exception $e) {
            error_log("Failed to generate thumbnail: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Parse a FEN string into a 2D board array
     * 
     * @param string $fen The FEN string to parse
     * @return array|null 2D array representing the board or null on failure
     */
    private static function parseFEN($fen) {
        try {
            $parts = explode(' ', $fen);
            $rows = explode('/', $parts[0]);
            
            if (count($rows) !== 8) {
                return null;
            }
            
            $board = [];
            
            foreach ($rows as $rowIdx => $row) {
                $board[$rowIdx] = [];
                $colIdx = 0;
                
                for ($i = 0; $i < strlen($row); $i++) {
                    $char = $row[$i];
                    
                    if (is_numeric($char)) {
                        // Empty squares
                        $empty = intval($char);
                        for ($j = 0; $j < $empty; $j++) {
                            $board[$rowIdx][$colIdx] = '';
                            $colIdx++;
                        }
                    } else {
                        // Piece
                        $board[$rowIdx][$colIdx] = $char;
                        $colIdx++;
                    }
                }
            }
            
            return $board;
            
        } catch (Exception $e) {
            error_log("Failed to parse FEN: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Get a move description in natural language
     * 
     * @param string $move The move in algebraic notation (e.g., 'e2e4', 'g1f3')
     * @param string $fen The FEN string before the move
     * @return string A natural language description of the move
     */
    public static function getMoveDescription($move, $fen) {
        // Basic implementation - could be expanded
        $from = substr($move, 0, 2);
        $to = substr($move, 2, 2);
        
        return "Move from $from to $to";
    }
    
    /**
     * Check if a move is valid
     * 
     * @param array $move Move data with from, to and optional promotion
     * @param string $fen Current position in FEN notation
     * @return bool True if move is valid
     */
    public static function isValidMove($move, $fen) {
        // Basic validation
        if (!isset($move['from']) || !isset($move['to'])) {
            return false;
        }
        
        // Simple validation of square coordinates
        if (!self::isValidSquare($move['from']) || !self::isValidSquare($move['to'])) {
            return false;
        }

        // For more complex validation, we would need to implement chess rules
        // or use a chess library like php-chess
        
        // For now, we'll assume the frontend chess.js library handles validation
        return true;
    }
    
    /**
     * Check if a square coordinate is valid
     * 
     * @param string $square Chess square (e.g., "e2")
     * @return bool True if valid
     */
    private static function isValidSquare($square) {
        if (strlen($square) !== 2) {
            return false;
        }
        
        $file = $square[0];
        $rank = $square[1];
        
        return preg_match('/^[a-h]$/', $file) && preg_match('/^[1-8]$/', $rank);
    }
    
    /**
     * Convert a move to SAN (Standard Algebraic Notation)
     * 
     * @param array $move Move data with from, to and optional promotion
     * @param string $fen Current position
     * @return string Move in SAN format
     */
    public static function moveToSan($move, $fen) {
        // This is a simplified version - a full implementation would require
        // tracking the full position and piece movements
        $from = $move['from'];
        $to = $move['to'];
        $promotion = isset($move['promotion']) ? $move['promotion'] : '';
        
        // Basic SAN format (simplified)
        return $from . $to . $promotion;
    }
    
    /**
     * Calculate new Elo rating after a game
     * 
     * @param int $playerRating Current rating of player
     * @param int $opponentRating Current rating of opponent
     * @param float $score Game result (1.0 for win, 0.5 for draw, 0.0 for loss)
     * @param int $kFactor K-factor (40 for new players, 20 for established players, 10 for masters)
     * @return int New rating
     */
    public static function calculateNewRating($playerRating, $opponentRating, $score, $kFactor = 20) {
        // Expected score based on Elo formula
        $expectedScore = 1 / (1 + pow(10, ($opponentRating - $playerRating) / 400));
        
        // Calculate new rating
        $newRating = round($playerRating + $kFactor * ($score - $expectedScore));
        
        return $newRating;
    }
    
    /**
     * Determine the default K-factor based on player's rating and games played
     * 
     * @param int $rating Player's current rating
     * @param int $gamesPlayed Number of games played
     * @return int K-factor value
     */
    public static function getKFactor($rating, $gamesPlayed) {
        if ($gamesPlayed < 30) {
            return 40; // New player
        } elseif ($rating >= 2400) {
            return 10; // Master-level player
        } else {
            return 20; // Established player
        }
    }
    
    /**
     * Validate FEN (Forsyth-Edwards Notation) string
     * 
     * @param string $fen FEN string to validate
     * @return bool True if valid
     */
    public static function validateFen($fen) {
        // Basic validation - check format
        $parts = explode(' ', $fen);
        if (count($parts) !== 6) {
            return false;
        }
        
        // Validate board part (ranks must add up to 8 squares)
        $ranks = explode('/', $parts[0]);
        if (count($ranks) !== 8) {
            return false;
        }
        
        foreach ($ranks as $rank) {
            $squares = 0;
            for ($i = 0; $i < strlen($rank); $i++) {
                $char = $rank[$i];
                if (is_numeric($char)) {
                    $squares += intval($char);
                } else if (preg_match('/^[prnbqkPRNBQK]$/', $char)) {
                    $squares++;
                } else {
                    return false; // Invalid character
                }
            }
            
            if ($squares !== 8) {
                return false; // Each rank must have 8 squares
            }
        }
        
        // Active color validation
        if ($parts[1] !== 'w' && $parts[1] !== 'b') {
            return false;
        }
        
        // Castling validation
        if (!preg_match('/^(-|[KQkq]+)$/', $parts[2])) {
            return false;
        }
        
        // En passant validation
        if ($parts[3] !== '-' && !preg_match('/^[a-h][36]$/', $parts[3])) {
            return false;
        }
        
        // Halfmove and fullmove counters must be non-negative integers
        if (!is_numeric($parts[4]) || intval($parts[4]) < 0 || 
            !is_numeric($parts[5]) || intval($parts[5]) < 1) {
            return false;
        }
        
        return true;
    }
}
?>
