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

$current_time = date('Y-m-d H:i:s');

// Get upcoming simuls
$upcoming_query = "
    SELECT 
        s.id,
        s.title,
        s.start_time,
        u.name as host,
        COUNT(sp.user_id) as participants_count
    FROM simul_games s
    LEFT JOIN users u ON s.host_id = u.id
    LEFT JOIN simul_participants sp ON s.id = sp.simul_id
    WHERE s.start_time > ?
    GROUP BY s.id
    ORDER BY s.start_time ASC
";

// Get past simuls
$past_query = "
    SELECT 
        s.id,
        s.title,
        s.start_time as date,
        u.name as host,
        COUNT(sp.user_id) as participants_count,
        s.results_link
    FROM simul_games s
    LEFT JOIN users u ON s.host_id = u.id
    LEFT JOIN simul_participants sp ON s.id = sp.simul_id
    WHERE s.start_time < ?
    GROUP BY s.id
    ORDER BY s.start_time DESC
";

$stmt = $conn->prepare($upcoming_query);
$stmt->bind_param("s", $current_time);
$stmt->execute();
$upcoming_result = $stmt->get_result();
$upcoming = $upcoming_result->fetch_all(MYSQLI_ASSOC);

$stmt = $conn->prepare($past_query);
$stmt->bind_param("s", $current_time);
$stmt->execute();
$past_result = $stmt->get_result();
$past = $past_result->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'upcoming' => $upcoming,
    'past' => $past
]);

$stmt->close();
$conn->close();
?>
