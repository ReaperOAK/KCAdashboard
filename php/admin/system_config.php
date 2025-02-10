<?php
require_once('../config.php');
session_start();

// Check if user is admin
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}

// Handle POST request to save configuration
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $maxStudents = intval($data['maxStudentsPerBatch']);
    $autoNotifications = $data['autoNotifications'] ? 1 : 0;
    $maintenanceMode = $data['maintainanceMode'] ? 1 : 0;

    $sql = "INSERT INTO system_config (
                max_students_per_batch, 
                auto_notifications, 
                maintenance_mode, 
                updated_by, 
                updated_at
            ) VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                max_students_per_batch = VALUES(max_students_per_batch),
                auto_notifications = VALUES(auto_notifications),
                maintenance_mode = VALUES(maintenance_mode),
                updated_by = VALUES(updated_by),
                updated_at = NOW()";

    $stmt = $conn->prepare($sql);
    $userId = $_SESSION['user_id'];
    $stmt->bind_param("iiii", $maxStudents, $autoNotifications, $maintenanceMode, $userId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save configuration']);
    }

    $stmt->close();
}

// Handle GET request to retrieve configuration
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM system_config ORDER BY updated_at DESC LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $config = $result->fetch_assoc();
        echo json_encode([
            'maxStudentsPerBatch' => intval($config['max_students_per_batch']),
            'autoNotifications' => (bool)$config['auto_notifications'],
            'maintainanceMode' => (bool)$config['maintenance_mode']
        ]);
    } else {
        // Return default values if no configuration exists
        echo json_encode([
            'maxStudentsPerBatch' => 20,
            'autoNotifications' => true,
            'maintainanceMode' => false
        ]);
    }
}

$conn->close();
?>
