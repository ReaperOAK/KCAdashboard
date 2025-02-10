<?php
require_once 'config.php';
header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['schedule']) || !isset($data['teacher'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $conn->begin_transaction();

    // Insert batch details
    $stmt = $conn->prepare("INSERT INTO batches (name, schedule, teacher) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $data['name'], $data['schedule'], $data['teacher']);
    $stmt->execute();
    $batchId = $conn->insert_id;

    // If meeting link is provided
    if (isset($data['meetingLink']) && !empty($data['meetingLink'])) {
        $stmtClass = $conn->prepare("INSERT INTO classes (batch_id, link) VALUES (?, ?)");
        $stmtClass->bind_param("is", $batchId, $data['meetingLink']);
        $stmtClass->execute();
    }

    // If students are assigned
    if (isset($data['students']) && is_array($data['students'])) {
        $stmtStudents = $conn->prepare("INSERT INTO batch_students (batch_id, student_id) VALUES (?, ?)");
        foreach ($data['students'] as $studentId) {
            $stmtStudents->bind_param("ii", $batchId, $studentId);
            $stmtStudents->execute();
        }
    }

    $conn->commit();
    echo json_encode(['success' => true, 'id' => $batchId]);

} catch(Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$stmt->close();
if (isset($stmtClass)) $stmtClass->close();
if (isset($stmtStudents)) $stmtStudents->close();
$conn->close();
?>
