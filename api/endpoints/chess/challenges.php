<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
require_once '../../config/Database.php';
require_once '../../models/ChessChallenge.php';
require_once '../../middleware/auth.php';

try {
    // Get authenticated user
    $user = getAuthUser();
    
    if(!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        exit;
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();

    // Clean up expired challenges first
    ChessChallenge::cleanupExpiredChallenges($db);
    
    // Create challenge object
    $challenge = new ChessChallenge($db);
    
    // Get pending challenges for the user
    $challenges = $challenge->getPendingChallenges($user['id']);
    
    // Check if any challenges exist
    if(count($challenges) > 0) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "challenges" => $challenges
        ]);
    } else {
        // No challenges found
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "challenges" => [],
            "message" => "No pending challenges found"
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve challenges",
        "error" => $e->getMessage()
    ]);
}
?>