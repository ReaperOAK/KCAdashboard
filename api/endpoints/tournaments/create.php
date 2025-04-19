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
            "message" => "Unauthorized. Only admins can create tournaments."
        ]);
        exit;
    }

    // Get tournament data from request
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if (!isset($data->title) || !isset($data->date_time) || !isset($data->type) || !isset($data->status)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Missing required fields"
        ]);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Create tournament in database
    $query = "INSERT INTO tournaments (
                title, 
                description, 
                date_time, 
                location, 
                type, 
                entry_fee, 
                prize_pool, 
                max_participants, 
                status, 
                lichess_id, 
                created_by, 
                created_at
              ) VALUES (
                :title, 
                :description, 
                :date_time, 
                :location, 
                :type, 
                :entry_fee, 
                :prize_pool, 
                :max_participants, 
                :status, 
                :lichess_id, 
                :created_by, 
                NOW()
              )";
              
    $stmt = $db->prepare($query);
    
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
    $stmt->bindParam(':created_by', $user['id']);
    
    if ($stmt->execute()) {
        // Log activity
        $tournament_id = $db->lastInsertId();
        
        $logQuery = "INSERT INTO activity_logs
                     (user_id, action, description, ip_address, created_at)
                     VALUES (:user_id, :action, :description, :ip_address, NOW())";
                     
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(":user_id", $user['id']);
        $action = "tournament_created";
        $logStmt->bindParam(":action", $action);
        $description = "Admin created tournament: " . $data->title;
        $logStmt->bindParam(":description", $description);
        $logStmt->bindParam(":ip_address", $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Tournament created successfully",
            "id" => $tournament_id
        ]);
    } else {
        throw new Exception("Failed to create tournament");
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to create tournament",
        "error" => $e->getMessage()
    ]);
}
?>
