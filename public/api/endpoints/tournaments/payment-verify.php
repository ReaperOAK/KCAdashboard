<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../models/Tournament.php';
require_once '../../middleware/auth.php';
require_once '../../services/NotificationService.php';

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
    
    // Get payment data
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->payment_id) || !isset($data->status) || 
        !in_array($data->status, ['approved', 'rejected'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Payment ID and valid status (approved/rejected) are required"
        ]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get payment details
    $query = "SELECT * FROM tournament_payments WHERE id = :payment_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":payment_id", $data->payment_id);
    $stmt->execute();
    $payment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$payment) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Payment not found"
        ]);
        exit;
    }
    
    // Update payment status
    $updateQuery = "UPDATE tournament_payments 
                   SET status = :status, 
                       verified_by = :verified_by,
                       verified_at = NOW()
                   WHERE id = :payment_id";
    $updateStmt = $db->prepare($updateQuery);
    $updateStmt->bindParam(":status", $data->status);
    $updateStmt->bindParam(":verified_by", $user['id']);
    $updateStmt->bindParam(":payment_id", $data->payment_id);
    $updateStmt->execute();
    
    // If approved, update registration status
    $notificationService = new NotificationService();
    if ($data->status === 'approved') {
        $tournament = new Tournament($db);
        $tournament->updatePaymentStatus($payment['tournament_id'], $payment['user_id'], 'completed');
        // Send notification to student
        $title = "Payment Approved";
        $message = "Your payment for tournament registration has been approved. You are now registered for the tournament.";
        $notificationService->sendCustom(
            $payment['user_id'],
            $title,
            $message,
            'payment',
            false
        );
    } else {
        // If rejected, update registration status to pending or remove registration
        $rejectQuery = "UPDATE tournament_registrations 
                       SET payment_status = 'rejected'
                       WHERE tournament_id = :tournament_id 
                       AND user_id = :user_id";
        $rejectStmt = $db->prepare($rejectQuery);
        $rejectStmt->bindParam(":tournament_id", $payment['tournament_id']);
        $rejectStmt->bindParam(":user_id", $payment['user_id']);
        $rejectStmt->execute();
        // Send notification to student
        $title = "Payment Rejected";
        $message = "Your payment for tournament registration has been rejected. Please contact support for more information.";
        $notificationService->sendCustom(
            $payment['user_id'],
            $title,
            $message,
            'payment',
            false
        );
    }
    
    // Log the action
    $logQuery = "INSERT INTO activity_logs
                (user_id, action, description, ip_address, created_at)
                VALUES (:user_id, :action, :description, :ip_address, NOW())";
                
    $action = "payment_verification";
    $description = "Admin " . ($data->status === 'approved' ? "approved" : "rejected") . " payment ID: " . $data->payment_id;
    
    $logStmt = $db->prepare($logQuery);
    $logStmt->bindParam(":user_id", $user['id']);
    $logStmt->bindParam(":action", $action);
    $logStmt->bindParam(":description", $description);
    $logStmt->bindParam(":ip_address", $_SERVER['REMOTE_ADDR']);
    $logStmt->execute();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Payment " . ($data->status === 'approved' ? "approved" : "rejected") . " successfully"
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to verify payment",
        "error" => $e->getMessage()
    ]);
}
?>
