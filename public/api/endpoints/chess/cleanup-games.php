<?php
/**
 * Automated cleanup endpoint for old chess games
 * 
 * This endpoint can be called periodically (via cron job) to automatically
 * expire inactive games. No authentication required as it's a maintenance task.
 * 
 * Optional parameters:
 * - days: Number of days of inactivity before expiring (default: 30)
 * - key: Optional security key for automated calls
 */

// Required headers
header("Content-Type: application/json; charset=UTF-8");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessGame.php';

try {
    // Get parameters
    $inactivityDays = isset($_GET['days']) ? intval($_GET['days']) : 30;
    $securityKey = isset($_GET['key']) ? $_GET['key'] : '';
    
    // Optional: Add a security key check if you want to secure this endpoint
    // Uncomment the lines below and set your own secret key
    /*
    $expectedKey = 'your-secret-cleanup-key-here';
    if ($securityKey !== $expectedKey) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid security key"
        ]);
        exit;
    }
    */
    
    // Validate days parameter
    if ($inactivityDays <= 0 || $inactivityDays > 365) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid inactivity days. Must be between 1 and 365."
        ]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Count games that will be expired
    $thresholdDate = date('Y-m-d H:i:s', strtotime("-{$inactivityDays} days"));
    $countQuery = "SELECT COUNT(*) as count FROM chess_games 
                   WHERE status = 'active' 
                   AND last_move_at < :threshold_date";
    
    $countStmt = $db->prepare($countQuery);
    $countStmt->bindParam(':threshold_date', $thresholdDate);
    $countStmt->execute();
    $result = $countStmt->fetch(PDO::FETCH_ASSOC);
    $gamesCount = $result['count'];
    
    // Perform the cleanup
    $success = ChessGame::cleanupExpiredGames($db, $inactivityDays);
    
    if ($success) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Games cleanup completed successfully",
            "expired_games_count" => $gamesCount,
            "inactivity_threshold_days" => $inactivityDays,
            "threshold_date" => $thresholdDate
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error occurred during games cleanup",
            "games_found" => $gamesCount
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Cleanup failed: " . $e->getMessage()
    ]);
}
?>
