<?php
// chess/cleanup-draw-offers.php
require_once '../../config/cors.php';
require_once '../../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Mark expired draw offers as expired
    $query = "UPDATE chess_draw_offers 
              SET status = 'expired' 
              WHERE status = 'pending' 
              AND expires_at < NOW()";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $expiredCount = $stmt->rowCount();
    
    // Optional: Clean up old expired and responded offers (older than 7 days)
    $cleanupQuery = "DELETE FROM chess_draw_offers 
                    WHERE status IN ('expired', 'accepted', 'declined') 
                    AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)";
    
    $cleanupStmt = $db->prepare($cleanupQuery);
    $cleanupStmt->execute();
    
    $cleanedCount = $cleanupStmt->rowCount();
    
    if (php_sapi_name() === 'cli') {
        echo "Cleanup completed:\n";
        echo "- Expired draw offers: $expiredCount\n";
        echo "- Cleaned old offers: $cleanedCount\n";
    } else {
        echo json_encode([
            "success" => true,
            "expired_count" => $expiredCount,
            "cleaned_count" => $cleanedCount
        ]);
    }
    
} catch (Exception $e) {
    error_log("Error in cleanup-draw-offers.php: " . $e->getMessage());
    
    if (php_sapi_name() === 'cli') {
        echo "Error: " . $e->getMessage() . "\n";
        exit(1);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Internal server error"]);
    }
}
?>
