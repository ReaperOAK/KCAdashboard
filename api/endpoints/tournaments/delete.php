<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Tournament.php';
require_once '../../middleware/auth.php';

try {
    // Get user from token
    $user = getAuthUser();
    
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized. Only admins can delete tournaments."
        ]);
        exit;
    }

    // Get tournament ID from request
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->id)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Tournament ID is required"
        ]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    $tournament = new Tournament($db);
    
    // Check if tournament exists
    $tournament_details = $tournament->getTournamentById($data->id);
    
    if (!$tournament_details) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Tournament not found"
        ]);
        exit;
    }
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Delete all registrations first
        $deleteRegistrationsQuery = "DELETE FROM tournament_registrations WHERE tournament_id = :tournament_id";
        $deleteRegistrationsStmt = $db->prepare($deleteRegistrationsQuery);
        $deleteRegistrationsStmt->bindParam(':tournament_id', $data->id);
        $deleteRegistrationsStmt->execute();
        
        // Delete all payments
        $deletePaymentsQuery = "DELETE FROM tournament_payments WHERE tournament_id = :tournament_id";
        $deletePaymentsStmt = $db->prepare($deletePaymentsQuery);
        $deletePaymentsStmt->bindParam(':tournament_id', $data->id);
        $deletePaymentsStmt->execute();
        
        // Finally delete the tournament itself
        $deleteTournamentQuery = "DELETE FROM tournaments WHERE id = :id";
        $deleteTournamentStmt = $db->prepare($deleteTournamentQuery);
        $deleteTournamentStmt->bindParam(':id', $data->id);
        $deleteTournamentStmt->execute();
        
        // Log activity
        $logQuery = "INSERT INTO activity_logs
                     (user_id, action, description, ip_address, created_at)
                     VALUES (:user_id, :action, :description, :ip_address, NOW())";
                     
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(":user_id", $user['id']);
        $action = "tournament_deleted";
        $logStmt->bindParam(":action", $action);
        $description = "Admin deleted tournament: " . $tournament_details['title'];
        $logStmt->bindParam(":description", $description);
        $logStmt->bindParam(":ip_address", $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        
        // Commit transaction
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Tournament deleted successfully"
        ]);
    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        throw $e;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to delete tournament",
        "error" => $e->getMessage()
    ]);
}
?>
