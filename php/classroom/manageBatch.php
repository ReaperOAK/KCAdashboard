<?php
require_once '../config.php';
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'create':
        $stmt = $conn->prepare("INSERT INTO batches (name, schedule, teacher) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $data['name'], $data['schedule'], $_SESSION['user_id']);
        break;
        
    case 'update':
        $stmt = $conn->prepare("UPDATE batches SET name = ?, schedule = ? WHERE id = ? AND teacher = ?");
        $stmt->bind_param("ssii", $data['name'], $data['schedule'], $data['id'], $_SESSION['user_id']);
        break;
        
    case 'delete':
        $stmt = $conn->prepare("DELETE FROM batches WHERE id = ? AND teacher = ?");
        $stmt->bind_param("ii", $data['id'], $_SESSION['user_id']);
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
}

$success = $stmt->execute();
echo json_encode(['success' => $success]);

$stmt->close();
$conn->close();
