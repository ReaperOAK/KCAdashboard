<?php
require_once 'config.php';
header('Content-Type: application/json');

session_start();

function getAttendanceData($batchId = null) {
    global $conn;
    
    $query = "SELECT a.*, c.time as class_time, u.name as student_name 
              FROM attendance a 
              JOIN classes c ON a.class_id = c.id 
              JOIN users u ON a.student_id = u.id";
    
    if ($batchId) {
        $query .= " WHERE c.batch_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $batchId);
    } else {
        $stmt = $conn->prepare($query);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $events = [];
    
    while ($row = $result->fetch_assoc()) {
        $events[] = [
            'title' => $row['student_name'] . ' - ' . $row['status'],
            'date' => $row['date'],
            'backgroundColor' => $row['status'] === 'present' ? '#32CD32' : '#FF0000'
        ];
    }
    
    return $events;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $batchId = isset($_GET['batchId']) ? $_GET['batchId'] : null;
    echo json_encode(getAttendanceData($batchId));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action']) && $data['action'] === 'syncZoom') {
        // Simulated Zoom sync response
        echo json_encode([
            'success' => true,
            'message' => 'Attendance synced successfully',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
}
?>
