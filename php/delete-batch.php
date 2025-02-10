<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Batch ID is required']);
    exit;
}

try {
    $conn->begin_transaction();

    // Delete related records first
    $stmtClasses = $conn->prepare("DELETE FROM classes WHERE batch_id = ?");
    $stmtClasses->bind_param("i", $data['id']);
    $stmtClasses->execute();

    $stmtStudents = $conn->prepare("DELETE FROM batch_students WHERE batch_id = ?");
    $stmtStudents->bind_param("i", $data['id']);
    $stmtStudents->execute();

    // Delete the batch
    $stmt = $conn->prepare("DELETE FROM batches WHERE id = ?");
    $stmt->bind_param("i", $data['id']);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $conn->commit();
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Batch not found');
    }

} catch(Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
$stmtClasses->close();
$stmtStudents->close();
$conn->close();
?>
