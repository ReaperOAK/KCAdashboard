<?php
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/cors.php';

try {
    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method is allowed');
    }

    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['name', 'level', 'schedule', 'max_students', 'teacher_id', 'status'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }

    // Validate field values
    if (!in_array($data['level'], ['beginner', 'intermediate', 'advanced'])) {
        throw new Exception('Invalid level value');
    }

    if (!in_array($data['status'], ['active', 'inactive', 'completed'])) {
        throw new Exception('Invalid status value');
    }

    if (!is_numeric($data['max_students']) || $data['max_students'] < 1) {
        throw new Exception('Invalid max_students value');
    }

    // Validate schedule format
    if (!isset($data['schedule']) || empty($data['schedule'])) {
        throw new Exception('Schedule is required');
    }

    $schedule = json_decode($data['schedule'], true);
    if (!$schedule || !isset($schedule['days']) || !isset($schedule['time']) || !isset($schedule['duration'])) {
        throw new Exception('Invalid schedule format');
    }

    if (empty($schedule['days'])) {
        throw new Exception('At least one day must be selected in schedule');
    }

    if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $schedule['time'])) {
        throw new Exception('Invalid time format in schedule');
    }

    if (!is_numeric($schedule['duration']) || $schedule['duration'] < 30) {
        throw new Exception('Duration must be at least 30 minutes');
    }

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // First verify if teacher exists
    $teacher_check = $db->prepare("SELECT id FROM users WHERE id = ? AND role = 'teacher'");
    $teacher_check->execute([$data['teacher_id']]);
    if (!$teacher_check->fetch()) {
        throw new Exception('Invalid teacher_id');
    }

    // Prepare insert query
    $query = "INSERT INTO batches (
                name, description, level, schedule, 
                max_students, teacher_id, status
              ) VALUES (
                :name, :description, :level, :schedule,
                :max_students, :teacher_id, :status
              )";
    
    $stmt = $db->prepare($query);
    
    // Execute with validated data
    $result = $stmt->execute([
        'name' => $data['name'],
        'description' => $data['description'] ?? '',
        'level' => $data['level'],
        'schedule' => $data['schedule'], // Store as JSON string
        'max_students' => (int)$data['max_students'],
        'teacher_id' => (int)$data['teacher_id'],
        'status' => $data['status']
    ]);
    
    if ($result) {
        $batch_id = $db->lastInsertId();
        
        // Fetch the created batch with teacher name
        $fetch_query = "SELECT b.*, u.full_name as teacher_name 
                       FROM batches b 
                       LEFT JOIN users u ON b.teacher_id = u.id 
                       WHERE b.id = ?";
        $stmt = $db->prepare($fetch_query);
        $stmt->execute([$batch_id]);
        $batch = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Batch created successfully',
            'batch' => $batch
        ]);
    } else {
        throw new Exception('Failed to create batch');
    }

} catch (Exception $e) {
    error_log("Create Batch Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create batch: ' . $e->getMessage(),
        'error' => $e->getMessage()
    ]);
}
?>
