<?php
require_once 'config.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    $student_id = $_SESSION['user_id'];
    
    // Get attendance records
    $stmt = $conn->prepare("
        SELECT a.*, c.subject, c.time 
        FROM attendance a
        JOIN classes c ON a.class_id = c.id
        WHERE a.student_id = ?
        ORDER BY c.time DESC
    ");
    $stmt->bind_param("i", $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $events = [];
    $total_classes = 0;
    $present_classes = 0;
    
    while ($row = $result->fetch_assoc()) {
        $total_classes++;
        if ($row['status'] == 'present') {
            $present_classes++;
        }
        
        $events[] = [
            'title' => $row['subject'],
            'date' => date('Y-m-d', strtotime($row['time'])),
            'status' => $row['status']
        ];
    }
    
    // Get attendance threshold from policies
    $threshold_query = "SELECT threshold FROM attendance_policies LIMIT 1";
    $threshold_result = $conn->query($threshold_query);
    $threshold = $threshold_result->fetch_assoc()['threshold'] ?? 75;
    
    // Calculate attendance percentage
    $attendance_percentage = $total_classes > 0 
        ? round(($present_classes / $total_classes) * 100, 2) 
        : 0;
    
    // Update attendance percentage in the attendance table
    $update_stmt = $conn->prepare("
        UPDATE attendance 
        SET attendance_percentage = ? 
        WHERE student_id = ?
    ");
    $update_stmt->bind_param("di", $attendance_percentage, $student_id);
    $update_stmt->execute();
    
    echo json_encode([
        'success' => true,
        'events' => $events,
        'percentage' => $attendance_percentage,
        'threshold' => $threshold
    ]);
    
} catch (Exception $e) {
    error_log($e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching attendance data'
    ]);
}

$conn->close();
?>
