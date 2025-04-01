<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Tournament.php';
require_once '../../middleware/auth.php';

try {
    // Get user information
    $user = getAuthUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized access"
        ]);
        exit;
    }
    
    // Check if tournament_id is provided
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Tournament ID is required"
        ]);
        exit;
    }
    
    $tournament_id = $_GET['id'];
    
    $database = new Database();
    $db = $database->getConnection();
    $tournament = new Tournament($db);
    
    // Get tournament details
    $tournament_details = $tournament->getTournamentById($tournament_id);
    
    if (!$tournament_details) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Tournament not found"
        ]);
        exit;
    }
    
    // Check if user is registered
    $isRegistered = $tournament->checkRegistration($tournament_id, $user['id']);
    
    // If registered, get registration details
    $registration = null;
    if ($isRegistered) {
        $query = "SELECT * FROM tournament_registrations 
                 WHERE tournament_id = :tournament_id 
                 AND user_id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":tournament_id", $tournament_id);
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->execute();
        $registration = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get payment details if any
        if ($registration) {
            $paymentQuery = "SELECT * FROM tournament_payments 
                           WHERE tournament_id = :tournament_id 
                           AND user_id = :user_id
                           ORDER BY created_at DESC
                           LIMIT 1";
            $paymentStmt = $db->prepare($paymentQuery);
            $paymentStmt->bindParam(":tournament_id", $tournament_id);
            $paymentStmt->bindParam(":user_id", $user['id']);
            $paymentStmt->execute();
            $payment = $paymentStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($payment) {
                $registration['payment'] = $payment;
            }
        }
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "tournament" => $tournament_details,
        "registration" => $registration,
        "is_registered" => $isRegistered
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch tournament details",
        "error" => $e->getMessage()
    ]);
}
?>
