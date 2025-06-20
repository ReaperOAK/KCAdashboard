<?php
/**
 * Manual cleanup script for old chess games
 * 
 * This script will expire all active chess games that haven't had any activity
 * for a specified number of days (default: 30 days)
 * 
 * Usage: php cleanup-old-games.php [days]
 * Example: php cleanup-old-games.php 7  (expires games older than 7 days)
 */

// Include required files
require_once '../config/Database.php';
require_once '../models/ChessGame.php';

// Get inactivity threshold from command line argument or default to 30 days
$inactivityDays = isset($argv[1]) ? intval($argv[1]) : 30;

if ($inactivityDays <= 0) {
    echo "Error: Inactivity days must be a positive number.\n";
    echo "Usage: php cleanup-old-games.php [days]\n";
    exit(1);
}

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Chess Games Cleanup Script\n";
    echo "==========================\n";
    echo "Expiring games inactive for more than {$inactivityDays} days...\n\n";
    
    // First, let's see what games will be affected
    $thresholdDate = date('Y-m-d H:i:s', strtotime("-{$inactivityDays} days"));
    $countQuery = "SELECT COUNT(*) as count FROM chess_games 
                   WHERE status = 'active' 
                   AND last_move_at < :threshold_date";
    
    $countStmt = $db->prepare($countQuery);
    $countStmt->bindParam(':threshold_date', $thresholdDate);
    $countStmt->execute();
    $result = $countStmt->fetch(PDO::FETCH_ASSOC);
    $gamesCount = $result['count'];
    
    echo "Found {$gamesCount} games to expire (last activity before {$thresholdDate})\n";
    
    if ($gamesCount > 0) {
        // Show some details about the games that will be expired
        $detailQuery = "SELECT g.id, g.last_move_at, 
                              w.full_name as white_player, 
                              b.full_name as black_player
                        FROM chess_games g
                        JOIN users w ON g.white_player_id = w.id
                        JOIN users b ON g.black_player_id = b.id
                        WHERE g.status = 'active' 
                        AND g.last_move_at < :threshold_date
                        ORDER BY g.last_move_at ASC
                        LIMIT 10";
        
        $detailStmt = $db->prepare($detailQuery);
        $detailStmt->bindParam(':threshold_date', $thresholdDate);
        $detailStmt->execute();
        
        echo "\nSample games to be expired:\n";
        echo "ID\tLast Move\t\tPlayers\n";
        echo "---\t---------\t\t-------\n";
        
        while ($row = $detailStmt->fetch(PDO::FETCH_ASSOC)) {
            echo "{$row['id']}\t{$row['last_move_at']}\t{$row['white_player']} vs {$row['black_player']}\n";
        }
        
        if ($gamesCount > 10) {
            echo "... and " . ($gamesCount - 10) . " more games\n";
        }
        
        // Ask for confirmation
        echo "\nDo you want to proceed with expiring these games? (y/N): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);
        
        if (trim(strtolower($line)) !== 'y') {
            echo "Operation cancelled.\n";
            exit(0);
        }
        
        // Perform the cleanup
        echo "\nExpiring games...\n";
        $success = ChessGame::cleanupExpiredGames($db, $inactivityDays);
        
        if ($success) {
            echo "✓ Successfully expired {$gamesCount} inactive games.\n";
            echo "  Status changed to: 'abandoned'\n";
            echo "  Result set to: '1/2-1/2'\n";
            echo "  Reason: 'inactivity timeout'\n";
        } else {
            echo "✗ Error occurred while expiring games.\n";
        }
    } else {
        echo "No games need to be expired.\n";
    }
    
    echo "\nCleanup completed.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
