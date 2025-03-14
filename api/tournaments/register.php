<?php
header('Content-Type: application/json');
require_once '../config/Database.php';
require_once '../middleware/auth.php';

try {
    // Authenticate user
    $user = verifyToken();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }
    
    // Check if request is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->tournament_id)) {
        throw new Exception('Tournament ID is required');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if the tournament exists and is upcoming
    $checkQuery = "SELECT id, title, status, entry_fee, max_participants FROM tournaments 
                   WHERE id = :tournament_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':tournament_id', $data->tournament_id);
    $checkStmt->execute();
    
    $tournament = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$tournament) {
        throw new Exception('Tournament not found');
    }
    
    if ($tournament['status'] !== 'upcoming') {
        throw new Exception('Registration is only available for upcoming tournaments');
    }
    
    // Check if the tournament has reached max participants
    if ($tournament['max_participants']) {
        $countQuery = "SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = :tournament_id";
        $countStmt = $db->prepare($countQuery);
        $countStmt->bindParam(':tournament_id', $data->tournament_id);
        $countStmt->execute();
        
        $currentParticipants = $countStmt->fetchColumn();
        
        if ($currentParticipants >= $tournament['max_participants']) {
            throw new Exception('Tournament has reached maximum number of participants');
        }
    }
    
    // Check if the user is already registered
    $checkRegQuery = "SELECT id FROM tournament_registrations 
                     WHERE tournament_id = :tournament_id AND user_id = :user_id";
    $checkRegStmt = $db->prepare($checkRegQuery);
    $checkRegStmt->bindParam(':tournament_id', $data->tournament_id);
    $checkRegStmt->bindParam(':user_id', $user['id']);
    $checkRegStmt->execute();
    
    if ($checkRegStmt->rowCount() > 0) {
        throw new Exception('You are already registered for this tournament');
    }
    
    // Determine payment status based on entry fee
    $paymentStatus = $tournament['entry_fee'] > 0 ? 'pending' : 'completed';
    
    // Register the user
    $registerQuery = "INSERT INTO tournament_registrations 
                     (tournament_id, user_id, payment_status) 
                     VALUES (:tournament_id, :user_id, :payment_status)";
    $registerStmt = $db->prepare($registerQuery);
    $registerStmt->bindParam(':tournament_id', $data->tournament_id);
    $registerStmt->bindParam(':user_id', $user['id']);
    $registerStmt->bindParam(':payment_status', $paymentStatus);
    
    if ($registerStmt->execute()) {
        // Create notification
        $notificationQuery = "INSERT INTO notifications 
                            (user_id, title, message, type) 
                            VALUES (:user_id, :title, :message, 'tournament')";
        $notificationStmt = $db->prepare($notificationQuery);
        $notificationStmt->bindParam(':user_id', $user['id']);
        $notificationStmt->bindParam(':title', $notificationTitle);
        $notificationStmt->bindParam(':message', $notificationMessage);
        
        $notificationTitle = "Tournament Registration";
        $notificationMessage = "You have successfully registered for {$tournament['title']}.";
        
        if ($tournament['entry_fee'] > 0) {
            $notificationMessage .= " Please complete payment to confirm your participation.";
        }
        
        $notificationStmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Successfully registered for tournament',
            'payment_required' => $tournament['entry_fee'] > 0,
            'payment_status' => $paymentStatus
        ]);
    } else {
        throw new Exception('Failed to register for tournament');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
