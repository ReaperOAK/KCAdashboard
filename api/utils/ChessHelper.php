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
    const THUMBNAIL_DIR = '../../uploads/chess/thumbnails/';
    
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
            return str_replace('../../', '/', $filepath);
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
     * @param string $move The move to check
     * @param string $fen The current position
     * @return bool Whether the move is valid
     */
    public static function isValidMove($move, $fen) {
        // This would require a full chess rules implementation
        // For simplicity, always return true in this example
        return true;
    }
}
?>
