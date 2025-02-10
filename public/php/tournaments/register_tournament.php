<?php
require_once('../config.php');
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not authenticated']);
    exit;
}

// Get tournament ID from POST request
$tournament_id = isset($_POST['tournament_id']) ? intval($_POST['tournament_id']) : 0;
$user_id = $_SESSION['user_id'];

if (!$tournament_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid tournament ID']);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();

    // Check if tournament exists and is open for registration
    $check_query = "SELECT t.id, t.max_participants, t.current_participants, t.date 
                    FROM tournaments t 
                    WHERE t.id = ?";
    
    $stmt = $conn->prepare($check_query);
    $stmt->bind_param('i', $tournament_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $tournament = $result->fetch_assoc();

    if (!$tournament) {
        throw new Exception('Tournament not found');
    }

    if (strtotime($tournament['date']) < time()) {
        throw new Exception('Tournament registration is closed');
    }

    if ($tournament['current_participants'] >= $tournament['max_participants']) {
        throw new Exception('Tournament is full');
    }

    // Check if user is already registered
    $check_registration = "SELECT id FROM tournament_participants 
                          WHERE tournament_id = ? AND user_id = ?";
    $stmt = $conn->prepare($check_registration);
    $stmt->bind_param('ii', $tournament_id, $user_id);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows > 0) {
        throw new Exception('Already registered for this tournament');
    }

    // Register user for tournament
    $register_query = "INSERT INTO tournament_participants (tournament_id, user_id) 
                      VALUES (?, ?)";
    $stmt = $conn->prepare($register_query);
    $stmt->bind_param('ii', $tournament_id, $user_id);
    $stmt->execute();

    // Update current participants count
    $update_query = "UPDATE tournaments 
                    SET current_participants = current_participants + 1 
                    WHERE id = ?";
    $stmt = $conn->prepare($update_query);
    $stmt->bind_param('i', $tournament_id);
    $stmt->execute();

    // Commit transaction
    $conn->commit();
    
    echo json_encode(['success' => true, 'message' => 'Successfully registered for tournament']);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>
