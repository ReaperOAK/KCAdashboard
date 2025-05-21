<?php
/**
 * Stockfish Engine Integration Class
 * Provides methods to interact with the Stockfish chess engine
 */
class Stockfish {
    private $stockfishPath;
    private $timeout;
    private $tempDir;
    
    /**
     * Constructor
     * 
     * @param string $stockfishPath Path to the stockfish executable
     * @param int $timeout Timeout in seconds for engine operations
     */
    public function __construct($stockfishPath = '/usr/local/bin/stockfish', $timeout = 5) {
        $this->stockfishPath = $stockfishPath;
        $this->timeout = $timeout;
        $this->tempDir = sys_get_temp_dir();
        
        // Check if we're on a Windows server
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $this->stockfishPath = 'C:\\stockfish\\stockfish.exe';
        }
    }
    
    /**
     * Analyze a position using Stockfish
     * 
     * @param string $fen The FEN string of the position
     * @param int $depth The search depth (higher = stronger but slower)
     * @return array|bool Analysis result or false on failure
     */
    public function analyze($fen, $depth = 15) {
        try {
            // Create unique files for this analysis
            $uniqueId = uniqid();
            $inputFile = $this->tempDir . "/sf_in_$uniqueId.txt";
            $outputFile = $this->tempDir . "/sf_out_$uniqueId.txt";
            
            // Prepare commands for Stockfish
            $commands = [
                "position fen $fen",
                "go depth $depth",
            ];
            
            // Write commands to input file
            file_put_contents($inputFile, implode("\n", $commands) . "\nquit\n");
            
            // Execute Stockfish with the commands
            $cmd = escapeshellcmd($this->stockfishPath) . " < " . escapeshellarg($inputFile) . " > " . escapeshellarg($outputFile) . " 2>&1";
            
            // Set time limit to prevent hanging
            set_time_limit($this->timeout + 10);
            
            // Execute the command
            exec($cmd, $output, $returnCode);
            
            // Read the output from the file
            $stockfishOutput = file_get_contents($outputFile);
            
            // Clean up temp files
            @unlink($inputFile);
            @unlink($outputFile);
            
            // Parse the output
            return $this->parseEngineOutput($stockfishOutput);
            
        } catch (Exception $e) {
            error_log("Stockfish analysis error: " . $e->getMessage());
            
            // Clean up temp files if they exist
            if (isset($inputFile) && file_exists($inputFile)) {
                @unlink($inputFile);
            }
            if (isset($outputFile) && file_exists($outputFile)) {
                @unlink($outputFile);
            }
            
            return false;
        }
    }
    
    /**
     * Parse the output from the Stockfish engine
     * 
     * @param string $output The raw output from Stockfish
     * @return array Parsed evaluation and best move
     */
    private function parseEngineOutput($output) {
        $lines = explode("\n", $output);
        $bestEval = null;
        $bestMove = null;
        $depth = 0;
        
        foreach ($lines as $line) {
            // Look for evaluation info
            if (strpos($line, 'info depth') !== false && strpos($line, 'score') !== false) {
                preg_match('/depth (\d+)/', $line, $depthMatches);
                preg_match('/score (cp|mate) ([-\d]+)/', $line, $scoreMatches);
                
                if (isset($depthMatches[1]) && isset($scoreMatches[1]) && isset($scoreMatches[2])) {
                    $currentDepth = (int)$depthMatches[1];
                    
                    // Only update if it's the deepest evaluation we've seen
                    if ($currentDepth > $depth) {
                        $depth = $currentDepth;
                        $scoreType = $scoreMatches[1]; // 'cp' or 'mate'
                        $scoreValue = (int)$scoreMatches[2];
                        
                        if ($scoreType === 'cp') {
                            // Convert centipawns to pawns
                            $evalScore = $scoreValue / 100;
                        } else {
                            // Mate score, keep as is
                            $evalScore = $scoreValue;
                        }
                        
                        $bestEval = [
                            'depth' => $depth,
                            'scoreType' => $scoreType,
                            'scoreValue' => $scoreValue,
                            'score' => $evalScore
                        ];
                        
                        // Try to extract principal variation (best line)
                        if (preg_match('/pv (.+)$/', $line, $pvMatches)) {
                            $bestEval['pv'] = $pvMatches[1];
                            // The first move in the PV is the best move
                            $moves = explode(' ', $pvMatches[1]);
                            $bestMove = $moves[0];
                        }
                    }
                }
            }
            
            // Look for best move
            if (strpos($line, 'bestmove') !== false) {
                preg_match('/bestmove (\w+)/', $line, $moveMatches);
                if (isset($moveMatches[1])) {
                    $bestMove = $moveMatches[1];
                }
            }
        }
        
        // If we found an evaluation
        if ($bestEval) {
            $bestEval['bestMove'] = $bestMove;
            return $bestEval;
        } else if ($bestMove) {
            // If we only found a best move
            return [
                'depth' => 0,
                'scoreType' => 'cp',
                'scoreValue' => 0,
                'score' => 0,
                'bestMove' => $bestMove
            ];
        }
        
        // Fallback if no evaluation was found
        return [
            'depth' => 0,
            'scoreType' => 'cp',
            'scoreValue' => 0,
            'score' => 0,
            'bestMove' => null
        ];
    }
    
    /**
     * Get the best move for a position
     * 
     * @param string $fen The FEN string of the position
     * @param int $moveTime Time in milliseconds to think
     * @return string|bool The best move or false on failure
     */
    public function getBestMove($fen, $moveTime = 1000) {
        try {
            // Create unique files for this analysis
            $uniqueId = uniqid();
            $inputFile = $this->tempDir . "/sf_in_$uniqueId.txt";
            $outputFile = $this->tempDir . "/sf_out_$uniqueId.txt";
            
            // Prepare commands for Stockfish
            $commands = [
                "position fen $fen",
                "go movetime $moveTime",
            ];
            
            // Write commands to input file
            file_put_contents($inputFile, implode("\n", $commands) . "\nquit\n");
            
            // Execute Stockfish with the commands
            $cmd = escapeshellcmd($this->stockfishPath) . " < " . escapeshellarg($inputFile) . " > " . escapeshellarg($outputFile) . " 2>&1";
            
            // Set time limit to prevent hanging
            set_time_limit(($moveTime / 1000) + 5);
            
            // Execute the command
            exec($cmd, $output, $returnCode);
            
            // Read the output from the file
            $stockfishOutput = file_get_contents($outputFile);
            
            // Clean up temp files
            @unlink($inputFile);
            @unlink($outputFile);
            
            // Extract best move
            if (preg_match('/bestmove (\w+)/', $stockfishOutput, $matches)) {
                return $matches[1];
            }
            
            return false;
            
        } catch (Exception $e) {
            error_log("Stockfish best move error: " . $e->getMessage());
            
            // Clean up temp files if they exist
            if (isset($inputFile) && file_exists($inputFile)) {
                @unlink($inputFile);
            }
            if (isset($outputFile) && file_exists($outputFile)) {
                @unlink($outputFile);
            }
            
            return false;
        }
    }
}
?>
