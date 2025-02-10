<?php
require_once '../config.php';
header('Content-Type: application/json');

session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$action = $_GET['action'] ?? '';
$teacher_id = $_SESSION['user_id'];

switch ($action) {
    case 'get':
        $stmt = $conn->prepare("SELECT * FROM resources WHERE teacher_id = ?");
        $stmt->bind_param("i", $teacher_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $materials = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($materials);
        break;

    case 'add':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("INSERT INTO resources (category, title, type, link, description, teacher_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssi", $data['category'], $data['title'], $data['type'], $data['link'], $data['description'], $teacher_id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success, 'id' => $conn->insert_id]);
        break;

    case 'delete':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("DELETE FROM resources WHERE id = ? AND teacher_id = ?");
        $stmt->bind_param("ii", $data['id'], $teacher_id);
        $success = $stmt->execute();
        echo json_encode(['success' => $success]);
        break;
}

$stmt->close();
$conn->close();
