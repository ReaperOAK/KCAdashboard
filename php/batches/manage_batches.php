<?php
header('Content-Type: application/json');
require_once('../config.php');

// Check if user is authenticated and is a teacher
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$teacher_id = $_SESSION['user_id'];

switch ($method) {
    case 'GET':
        // Fetch batches
        $stmt = $conn->prepare("SELECT * FROM batches WHERE teacher_id = ?");
        $stmt->bind_param("i", $teacher_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $batches = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($batches);
        break;

    case 'POST':
        // Create new batch
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $conn->prepare("INSERT INTO batches (name, schedule, teacher_id) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $data['name'], $data['schedule'], $teacher_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'id' => $conn->insert_id,
                'message' => 'Batch created successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create batch']);
        }
        break;

    case 'PUT':
        // Update batch
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $conn->prepare("UPDATE batches SET name = ?, schedule = ? WHERE id = ? AND teacher_id = ?");
        $stmt->bind_param("ssii", $data['name'], $data['schedule'], $data['id'], $teacher_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Batch updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update batch']);
        }
        break;

    case 'DELETE':
        // Delete batch
        $id = $_GET['id'];
        
        $stmt = $conn->prepare("DELETE FROM batches WHERE id = ? AND teacher_id = ?");
        $stmt->bind_param("ii", $id, $teacher_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Batch deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete batch']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

$conn->close();
?>
