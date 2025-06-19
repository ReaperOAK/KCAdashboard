<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate authentication
    $user_id = validateToken();
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    $pgn_content = $data['pgn_content'] ?? '';
    
    if (empty($pgn_content)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'PGN content is required',
            'errors' => ['PGN content cannot be empty']
        ]);
        exit;
    }
    
    $errors = [];
    $warnings = [];
    $info = [];
    
    // Basic PGN format validation
    $lines = explode("\n", trim($pgn_content));
    $headerTags = [];
    $moveText = '';
    $inMoveText = false;
    
    foreach ($lines as $lineNum => $line) {
        $line = trim($line);
        
        // Skip empty lines
        if (empty($line)) continue;
        
        // Check for header tags
        if (preg_match('/^\[(\w+)\s+"([^"]*)"\]$/', $line, $matches)) {
            if ($inMoveText) {
                $errors[] = "Line " . ($lineNum + 1) . ": Header tag found after moves started";
            }
            $headerTags[$matches[1]] = $matches[2];
        }
        // Check for invalid header format
        elseif (preg_match('/^\[/', $line)) {
            $errors[] = "Line " . ($lineNum + 1) . ": Invalid header tag format";
        }
        // Move text
        else {
            $inMoveText = true;
            $moveText .= $line . ' ';
        }
    }
    
    // Check required header tags
    $requiredTags = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
    foreach ($requiredTags as $tag) {
        if (!isset($headerTags[$tag])) {
            $warnings[] = "Missing recommended header tag: $tag";
        }
    }
    
    // Validate Date format
    if (isset($headerTags['Date'])) {
        $date = $headerTags['Date'];
        if (!preg_match('/^\d{4}\.\d{2}\.\d{2}$/', $date) && $date !== '????.??.??') {
            $warnings[] = "Date format should be YYYY.MM.DD or ????.??.??";
        }
    }
    
    // Validate Result
    if (isset($headerTags['Result'])) {
        $result = $headerTags['Result'];
        if (!in_array($result, ['1-0', '0-1', '1/2-1/2', '*'])) {
            $errors[] = "Result must be one of: 1-0, 0-1, 1/2-1/2, or *";
        }
    }
    
    // Basic move validation
    $moveText = trim($moveText);
    if (!empty($moveText)) {
        // Remove comments and variations
        $cleanMoves = preg_replace('/\{[^}]*\}/', '', $moveText); // Remove comments
        $cleanMoves = preg_replace('/\([^)]*\)/', '', $cleanMoves); // Remove variations
        
        // Check for basic move pattern
        if (!preg_match('/\d+\./', $cleanMoves)) {
            $warnings[] = "No move numbers found in move text";
        }
        
        // Check for game termination
        $gameTerminators = ['1-0', '0-1', '1/2-1/2', '*'];
        $hasTerminator = false;
        foreach ($gameTerminators as $terminator) {
            if (strpos($moveText, $terminator) !== false) {
                $hasTerminator = true;
                break;
            }
        }
        
        if (!$hasTerminator) {
            $warnings[] = "Game should end with a result marker (1-0, 0-1, 1/2-1/2, or *)";
        }
        
        // Basic move format check
        $tokens = preg_split('/\s+/', $cleanMoves);
        $moveCount = 0;
        
        foreach ($tokens as $token) {
            $token = trim($token);
            if (empty($token)) continue;
            
            // Skip move numbers
            if (preg_match('/^\d+\.+$/', $token)) continue;
            
            // Skip result markers
            if (in_array($token, $gameTerminators)) continue;
            
            // Check move format (basic validation)
            if (preg_match('/^[KQRBN]?[a-h]?[1-8]?[x]?[a-h][1-8][=]?[QRBN]?[+#]?$|^O-O(-O)?[+#]?$/', $token)) {
                $moveCount++;
            } elseif (!empty($token)) {
                $warnings[] = "Potentially invalid move format: $token";
            }
        }
        
        $info[] = "Found $moveCount moves";
    } else {
        $warnings[] = "No moves found in PGN";
    }
    
    // Additional info
    if (!empty($headerTags)) {
        $info[] = "Found " . count($headerTags) . " header tags";
        
        if (isset($headerTags['White']) && isset($headerTags['Black'])) {
            $info[] = "Game: {$headerTags['White']} vs {$headerTags['Black']}";
        }
        
        if (isset($headerTags['Event'])) {
            $info[] = "Event: {$headerTags['Event']}";
        }
    }
    
    // Determine validation status
    $isValid = empty($errors);
    $hasWarnings = !empty($warnings);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'valid' => $isValid,
        'has_warnings' => $hasWarnings,
        'errors' => $errors,
        'warnings' => $warnings,
        'info' => $info,
        'header_tags' => $headerTags,
        'message' => $isValid ? 
            ($hasWarnings ? 'PGN is valid but has warnings' : 'PGN is valid') : 
            'PGN has validation errors'
    ]);
    
} catch (Exception $e) {
    error_log("PGN validation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to validate PGN',
        'error' => $e->getMessage()
    ]);
}
?>
