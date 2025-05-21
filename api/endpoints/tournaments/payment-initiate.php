<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../models/Tournament.php';
require_once '../../middleware/auth.php';

try {
    // Get user ID from token
    $user = getAuthUser();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized access"
        ]);
        exit;
    }
    
    // Check if tournament_id and payment_screenshot are set
    if (!isset($_POST['tournament_id']) || !isset($_FILES['payment_screenshot'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Tournament ID and payment screenshot are required"
        ]);
        exit;
    }
    
    $tournament_id = $_POST['tournament_id'];
    $screenshot = $_FILES['payment_screenshot'];
    
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!in_array($screenshot['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid file type. Only JPEG and PNG are allowed."
        ]);
        exit;
    }
    
    // Validate file size (5MB max)
    if ($screenshot['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "File size exceeds 5MB limit"
        ]);
        exit;
    }
    
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
    
    // Check if user is already registered
    $isRegistered = $tournament->checkRegistration($tournament_id, $user['id']);
    
    // If not registered, register them first
    if (!$isRegistered) {
        $tournament->registerUser($tournament_id, $user['id']);
    }
    
    // Create upload directory if it doesn't exist
    $upload_dir = __DIR__ . '/../../uploads/payments/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Generate unique filename
    $filename = 'payment_' . $user['id'] . '_' . $tournament_id . '_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . pathinfo($screenshot['name'], PATHINFO_EXTENSION);
    $target_file = $upload_dir . $filename;
    
    // Upload file
    if (move_uploaded_file($screenshot['tmp_name'], $target_file)) {
        // Save payment information to database
        $query = "INSERT INTO tournament_payments
                 (tournament_id, user_id, screenshot_path, amount, status, created_at)
                 VALUES (:tournament_id, :user_id, :screenshot_path, :amount, 'pending', NOW())";
                 
        $stmt = $db->prepare($query);
        $stmt->bindParam(":tournament_id", $tournament_id);
        $stmt->bindParam(":user_id", $user['id']);
        $stmt->bindParam(":screenshot_path", $filename);
        $stmt->bindParam(":amount", $tournament_details['entry_fee']);
        $stmt->execute();
        
        // Record payment in activity logs
        $action = "tournament_payment_upload";
        $description = "User uploaded payment screenshot for tournament: " . $tournament_details['title'];
        
        $logQuery = "INSERT INTO activity_logs
                     (user_id, action, description, ip_address, created_at)
                     VALUES (:user_id, :action, :description, :ip_address, NOW())";
                     
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(":user_id", $user['id']);
        $logStmt->bindParam(":action", $action);
        $logStmt->bindParam(":description", $description);
        $logStmt->bindParam(":ip_address", $_SERVER['REMOTE_ADDR']);
        $logStmt->execute();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Payment screenshot uploaded successfully. Your registration is pending admin verification."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to upload payment screenshot"
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to process payment",
        "error" => $e->getMessage()
    ]);
}
?>
