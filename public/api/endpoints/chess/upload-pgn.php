<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

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
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    $required_fields = ['pgn_content', 'title'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }
    
    // Get current user (with fallback for development)
    $teacher_id = null;
    $current_user = null;
    try {
        $current_user = getAuthUser();
        if ($current_user && isset($current_user['id'])) {
            // Prevent students from uploading PGNs
            if (isset($current_user['role']) && strtolower($current_user['role']) === 'student') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Students are not allowed to upload PGN files.',
                    'error_code' => 'FORBIDDEN_ROLE'
                ]);
                exit();
            }
            $teacher_id = $current_user['id'];
        }
    } catch (Exception $e) {
        error_log("Auth failed, using default teacher ID: " . $e->getMessage());
    }
    // Fallback to default teacher ID if no authentication
    if (!$teacher_id) {
        $teacher_id = 1; // Default teacher ID for development
    }

    // Validate PGN content
    $pgn_content = trim($input['pgn_content']);
    if (strlen($pgn_content) < 10) {
        throw new Exception('PGN content is too short');
    }
    
    // Check for game count limit (max 50 games per PGN upload)
    preg_match_all('/\[Event\s*"[^"]*"\]/', $pgn_content, $event_matches);
    $game_count = count($event_matches[0]);
    if ($game_count > 50) {
        throw new Exception('Too many games in PGN file. Maximum allowed is 50 games per upload. Found ' . $game_count . ' games.');
    }
    
    // Basic PGN validation - check for valid PGN format
    if (!preg_match('/\[Event\s*"[^"]*"\]/', $pgn_content) && 
        !preg_match('/\[Event\s*\'[^\']*\'\]/', $pgn_content) &&
        !preg_match('/1\./', $pgn_content)) {
        throw new Exception('Invalid PGN format - missing game headers or moves');
    }

    // Prepare data
    $title = trim($input['title']);
    $description = isset($input['description']) ? trim($input['description']) : '';
    $category = isset($input['category']) ? $input['category'] : 'strategy';
    $is_public = isset($input['is_public']) ? (bool)$input['is_public'] : true; // Default to public
    // Visibility: public, private, batch, students
    $visibility = isset($input['visibility']) ? $input['visibility'] : ($is_public ? 'public' : 'private');
    $visibility_details = isset($input['visibility_details']) ? $input['visibility_details'] : null;
    $metadata = isset($input['metadata']) ? $input['metadata'] : [];
    $metadata['visibility'] = $visibility;
    $metadata['visibility_details'] = $visibility_details;
    $metadata = json_encode($metadata);
    
    // Validate category
    $valid_categories = ['opening', 'middlegame', 'endgame', 'tactics', 'strategy'];
    if (!in_array($category, $valid_categories)) {
        $category = 'strategy';
    }

    // Create uploads directory if it doesn't exist
    $uploads_dir = __DIR__ . '/../../uploads/pgn/';
    if (!is_dir($uploads_dir)) {
        if (!mkdir($uploads_dir, 0755, true)) {
            throw new Exception('Failed to create uploads directory');
        }
    }

    // Generate unique filename
    $filename = date('Y-m-d_H-i-s') . '_' . uniqid() . '.pgn';
    $file_path = $uploads_dir . $filename;
    $relative_path = 'uploads/pgn/' . $filename;

    // Save PGN content to file
    if (file_put_contents($file_path, $pgn_content) === false) {
        throw new Exception('Failed to save PGN file');
    }

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        // Clean up file if database fails
        if (file_exists($file_path)) {
            unlink($file_path);
        }
        throw new Exception('Database connection failed');
    }

    // Insert metadata into database (without pgn_content in database)
    $query = "INSERT INTO pgn_files 
              (title, description, category, file_path, is_public, teacher_id, created_at, metadata) 
              VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)";
    
    try {
        $stmt = $db->prepare($query);
        if (!$stmt) {
            if (file_exists($file_path)) {
                unlink($file_path); // Clean up file
            }
            throw new Exception('Database prepare failed');
        }
        
        $result = $stmt->execute([$title, $description, $category, $relative_path, $is_public, $teacher_id, $metadata]);
        
        if (!$result) {
            if (file_exists($file_path)) {
                unlink($file_path); // Clean up file
            }
            $errorInfo = $stmt->errorInfo();
            throw new Exception('Database execution failed: ' . $errorInfo[2]);
        }
        
        $pgn_id = $db->lastInsertId();
        
        if (!$pgn_id) {
            if (file_exists($file_path)) {
                unlink($file_path); // Clean up file
            }
            throw new Exception('Failed to get insert ID');
        }
    } catch (PDOException $e) {
        if (file_exists($file_path)) {
            unlink($file_path); // Clean up file
        }
        throw new Exception('PDO Error: ' . $e->getMessage());
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'PGN uploaded successfully',
        'pgn_id' => $pgn_id,
        'data' => [
            'id' => $pgn_id,
            'title' => $title,
            'category' => $category,
            'is_public' => $is_public,
            'file_path' => $relative_path,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    error_log("PGN upload error: " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => 'UPLOAD_FAILED'
    ]);
}
?>
