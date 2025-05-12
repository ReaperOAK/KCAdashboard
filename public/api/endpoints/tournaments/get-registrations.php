<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Tournament.php';
require_once '../../middleware/auth.php';

try {
    // Get user ID from token
    $user = getAuthUser();
    
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized access. Admin privileges required."
        ]);
        exit;
    }
    
    // Check if tournament_id is provided
    if (!isset($_GET['tournament_id'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Tournament ID is required"
        ]);
        exit;
    }
    
    $tournament_id = $_GET['tournament_id'];
    
    $database = new Database();
    $db = $database->getConnection();
    $tournament = new Tournament($db);
    
    // Check if tournament exists
    $tournament_details = $tournament->getTournamentById($tournament_id);
    
    if (!$tournament_details) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Tournament not found"
        ]);
        exit;
    }
    
    // Get all registrations for this tournament
    $registrations = $tournament->getRegistrationsByTournament($tournament_id);
    
    // Get payment information
    $paymentQuery = "SELECT tp.* FROM tournament_payments tp 
                     WHERE tp.tournament_id = :tournament_id
                     ORDER BY tp.created_at DESC";
    $paymentStmt = $db->prepare($paymentQuery);
    $paymentStmt->bindParam(":tournament_id", $tournament_id);
    $paymentStmt->execute();
    $payments = $paymentStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Map payments to users
    $paymentsByUser = [];
    foreach ($payments as $payment) {
        if (!isset($paymentsByUser[$payment['user_id']]) || 
            strtotime($payment['created_at']) > strtotime($paymentsByUser[$payment['user_id']]['created_at'])) {
            $paymentsByUser[$payment['user_id']] = $payment;
        }
    }
    
    // Add payment information to registrations
    foreach ($registrations as &$registration) {
        $registration['payment'] = isset($paymentsByUser[$registration['user_id']]) 
            ? $paymentsByUser[$registration['user_id']] 
            : null;
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "tournament" => $tournament_details,
        "registrations" => $registrations
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch tournament registrations",
        "error" => $e->getMessage()
    ]);
}
?>
