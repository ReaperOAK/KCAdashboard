<?php
header('Content-Type: application/json');
require_once '../../config.php';

session_start();

// Check if user is authenticated
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Get simul ID from URL
$simul_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($simul_id === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid simul ID']);
    exit;
}

// Check if simul exists and is not full
$check_query = "
    SELECT 
        s.id,
        COUNT(sp.user_id) as current_participants
    FROM simul_games s
    LEFT JOIN simul_participants sp ON s.id = sp.simul_id
    WHERE s.id = ? AND s.start_time > NOW()
    GROUP BY s.id
    HAVING current_participants < 20
";

$stmt = $conn->prepare($check_query);
$stmt->bind_param("i", $simul_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Simul is either full, expired, or does not exist']);
    exit;
}

// Check if user is already registered
$check_participant = "
    SELECT id FROM simul_participants 
    WHERE simul_id = ? AND user_id = ?
";

$stmt = $conn->prepare($check_participant);
$stmt->bind_param("ii", $simul_id, $_SESSION['user_id']);
$stmt->execute();

if ($stmt->get_result()->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Already registered for this simul']);
    exit;
}

// Add user to simul
$insert_query = "
    INSERT INTO simul_participants (simul_id, user_id, registration_time)
    VALUES (?, ?, NOW())
";

$stmt = $conn->prepare($insert_query);
$stmt->bind_param("ii", $simul_id, $_SESSION['user_id']);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Successfully joined simul']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to join simul']);
}

$stmt->close();
$conn->close();
?>
