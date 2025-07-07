<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../models/Tournament.php';
require_once '../../middleware/auth.php';
require_once '../../services/NotificationService.php';

try {
    // Get user from token
    $user = getAuthUser();
    
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized. Only admins can update tournaments."
        ]);
        exit;
    }

    // Get tournament data from request
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if (!isset($data->id) || !isset($data->title) || !isset($data->date_time) || !isset($data->status)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields"
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
    
    // Update tournament in database
    $query = "UPDATE tournaments SET
                title = :title, 
                description = :description, 
                date_time = :date_time, 
                location = :location, 
                type = :type, 
                entry_fee = :entry_fee, 
                prize_pool = :prize_pool, 
                max_participants = :max_participants, 
                status = :status, 
                lichess_id = :lichess_id
              WHERE id = :id";
              
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':id', $data->id);
    $stmt->bindParam(':title', $data->title);
    $stmt->bindParam(':description', $data->description);
    $stmt->bindParam(':date_time', $data->date_time);
    $stmt->bindParam(':location', $data->location);
    $stmt->bindParam(':type', $data->type);
    $stmt->bindParam(':entry_fee', $data->entry_fee);
    $stmt->bindParam(':prize_pool', $data->prize_pool);
    $stmt->bindParam(':max_participants', $data->max_participants);
    $stmt->bindParam(':status', $data->status);
    $stmt->bindParam(':lichess_id', $data->lichess_id);
    
    if ($stmt->execute()) {
        // Log activity
        $logQuery = "INSERT INTO activity_logs
                     (user_id, action, description, ip_address, created_at)
                     VALUES (:user_id, :action, :description, :ip_address, NOW())";
                     
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(":user_id", $user['id']);
        $action = "tournament_updated";
        $logStmt->bindParam(":action", $action);
        $description = "Admin updated tournament: " . $data->title;
        $logStmt->bindParam(":description", $description);
        $logStmt->bindParam(":ip_address", $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        
        // If tournament was updated to ongoing status and is online, send notifications
        if ($data->status === 'ongoing' && $data->type === 'online' && $tournament_details['status'] !== 'ongoing') {
            // Get all registered users with completed payments
            $registrationsQuery = "SELECT u.id FROM tournament_registrations tr 
                                 JOIN users u ON tr.user_id = u.id 
                                 WHERE tr.tournament_id = :tournament_id 
                                 AND tr.payment_status = 'completed'";
            $registrationsStmt = $db->prepare($registrationsQuery);
            $registrationsStmt->bindParam(':tournament_id', $data->id);
            $registrationsStmt->execute();
            $registrations = $registrationsStmt->fetchAll(PDO::FETCH_ASSOC);
            // Use NotificationService to send notifications in bulk
            if (!empty($registrations)) {
                $userIds = array_column($registrations, 'id');
                $notificationService = new NotificationService();
                $notifTitle = "Tournament Started";
                $notifMsg = "The tournament '" . $data->title . "' has started. Join now!";
                $notificationService->sendBulkCustom(
                    $userIds,
                    $notifTitle,
                    $notifMsg,
                    'tournament',
                    false
                );
            }
        }
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Tournament updated successfully"
        ]);
    } else {
        throw new Exception("Failed to update tournament");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update tournament",
        "error" => $e->getMessage()
    ]);
}
?>
