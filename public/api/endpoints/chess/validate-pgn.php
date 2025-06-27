<?php

require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Validate authentication
    $user = validateToken();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['pgn_content'])) {
        throw new Exception('Missing required field: pgn_content');
    }
    
    $pgn_content = trim($input['pgn_content']);
    
    if (strlen($pgn_content) < 10) {
        throw new Exception('PGN content is too short');
    }
    
    // Initialize validation results
    $validation_result = [
        'is_valid' => true,
        'errors' => [],
        'warnings' => [],
        'game_count' => 0,
        'games' => [],
        'metadata' => []
    ];
    
    // Basic PGN structure validation
    // Split games by looking for Event headers which indicate new games
    $games = preg_split('/(?=\[Event\s)/m', $pgn_content);
    
    // Remove empty entries and clean up
    $games = array_filter($games, function($game) {
        return trim($game) !== '' && strpos($game, '[Event') !== false;
    });
    
    // If no games found by Event headers, try alternative splitting
    if (empty($games)) {
        $games = preg_split('/\n\s*\n\s*\[/', $pgn_content);
        if (count($games) > 1) {
            // Multiple games - prepend [ to subsequent games
            for ($i = 1; $i < count($games); $i++) {
                $games[$i] = '[' . $games[$i];
            }
        }
        // Remove empty entries
        $games = array_filter($games, function($game) {
            return trim($game) !== '';
        });
    }
    
    $validation_result['game_count'] = count($games);
    
    foreach ($games as $game_index => $game_content) {
        $game_validation = [
            'game_number' => $game_index + 1,
            'has_headers' => false,
            'has_moves' => false,
            'headers' => [],
            'errors' => [],
            'warnings' => [],
            'move_count' => 0
        ];
        
        // Check for required headers
        $required_headers = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'];
        $found_headers = [];
        
        if (preg_match_all('/\[([^"]+)(?:\s+"([^"]*)"|)\]/', $game_content, $header_matches, PREG_SET_ORDER)) {
            $game_validation['has_headers'] = true;
            
            foreach ($header_matches as $match) {
                $header_name = trim($match[1]);
                $header_value = isset($match[2]) ? trim($match[2]) : '';
                $found_headers[$header_name] = $header_value;
                $game_validation['headers'][$header_name] = $header_value;
            }
            
            // Only warn about missing non-critical headers
            $missing_critical = [];
            foreach (['Event', 'White', 'Black'] as $critical) {
                if (!isset($found_headers[$critical])) {
                    $missing_critical[] = $critical;
                }
            }
            
            if (!empty($missing_critical)) {
                $game_validation['errors'][] = 'Missing critical headers: ' . implode(', ', $missing_critical);
                $validation_result['is_valid'] = false;
            }
            
            // Warn about other missing headers (but don't mark as invalid)
            foreach (['Site', 'Date', 'Round', 'Result'] as $recommended) {
                if (!isset($found_headers[$recommended])) {
                    $game_validation['warnings'][] = "Missing recommended header: {$recommended}";
                }
            }
        } else {
            $validation_result['is_valid'] = false;
            $game_validation['errors'][] = 'No valid headers found';
        }
        
        // Check for moves - be more flexible with move detection
        if (preg_match('/\d+\.\s*[a-zA-Z0-9\-\+\=\#\(\)]*/', $game_content)) {
            $game_validation['has_moves'] = true;
            
            // Count moves (approximate) - count move numbers
            preg_match_all('/\d+\./', $game_content, $move_matches);
            $game_validation['move_count'] = count($move_matches[0]);
        } else {
            $game_validation['warnings'][] = 'No moves found in game';
        }
        
        // Check for game result
        if (preg_match('/(1-0|0-1|1\/2-1\/2|\*)/', $game_content)) {
            // Result found
        } else {
            $game_validation['warnings'][] = 'No game result found';
        }
        
        // Check for variations (advanced feature)
        if (preg_match('/\([^)]*\)/', $game_content)) {
            $game_validation['has_variations'] = true;
        }
        
        // Check for comments
        if (preg_match('/\{[^}]*\}/', $game_content)) {
            $game_validation['has_comments'] = true;
        }
        
        // Check for NAGs (Numeric Annotation Glyphs)
        if (preg_match('/\$\d+/', $game_content)) {
            $game_validation['has_nags'] = true;
        }
        
        // Validate specific fields - be more lenient
        if (isset($found_headers['Date'])) {
            $date = $found_headers['Date'];
            // Accept various date formats including ?
            if ($date !== '????.??.??' && !preg_match('/^\d{4}\.\d{2}\.\d{2}$/', $date) && !preg_match('/^\d{4}\.\?\?\.\?\?$/', $date)) {
                $game_validation['warnings'][] = 'Unusual date format: ' . $date;
            }
        }
        
        if (isset($found_headers['Result'])) {
            $result = $found_headers['Result'];
            if (!in_array($result, ['1-0', '0-1', '1/2-1/2', '*'])) {
                $game_validation['warnings'][] = 'Unusual result format: ' . $result;
            }
        }
        
        // Check for ECO code
        if (isset($found_headers['ECO'])) {
            $eco = $found_headers['ECO'];
            if (!preg_match('/^[A-E]\d{2}$/', $eco)) {
                $game_validation['warnings'][] = 'Invalid ECO code format';
            }
        }
        
        // Aggregate errors and warnings
        if (!empty($game_validation['errors'])) {
            $validation_result['is_valid'] = false;
            $validation_result['errors'] = array_merge($validation_result['errors'], $game_validation['errors']);
        }
        
        $validation_result['warnings'] = array_merge($validation_result['warnings'], $game_validation['warnings']);
        $validation_result['games'][] = $game_validation;
    }
    
    // Additional global validations
    if ($validation_result['game_count'] === 0) {
        $validation_result['is_valid'] = false;
        $validation_result['errors'][] = 'No games found in PGN content';
    }
    
    // Check file size (approximate)
    $size_kb = strlen($pgn_content) / 1024;
    if ($size_kb > 1024) { // 1MB limit
        $validation_result['warnings'][] = 'Large file size detected (' . round($size_kb, 2) . 'KB)';
    }
    
    // Extract metadata for summary
    $validation_result['metadata'] = [
        'total_games' => $validation_result['game_count'],
        'total_errors' => count($validation_result['errors']),
        'total_warnings' => count($validation_result['warnings']),
        'estimated_size_kb' => round($size_kb, 2),
        'has_variations' => false,
        'has_comments' => false,
        'has_nags' => false
    ];
    
    // Check if any game has advanced features
    foreach ($validation_result['games'] as $game) {
        if (isset($game['has_variations']) && $game['has_variations']) {
            $validation_result['metadata']['has_variations'] = true;
        }
        if (isset($game['has_comments']) && $game['has_comments']) {
            $validation_result['metadata']['has_comments'] = true;
        }
        if (isset($game['has_nags']) && $game['has_nags']) {
            $validation_result['metadata']['has_nags'] = true;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $validation_result
    ]);
    
} catch (Exception $e) {
    error_log("PGN validation error: " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => 'VALIDATION_FAILED'
    ]);
}
?>
