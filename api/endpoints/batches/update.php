<?php
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/cors.php';

try {
    // Only allow PUT requests
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        throw new Exception('Only PUT method is allowed');
    }

    // Get the batch ID
    $id = $_GET['id'] ?? null;
    if (!$id) {
        throw new Exception('Batch ID is required');
    }

    // Get PUT data
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

    // First verify if batch exists
    $check_query = "SELECT id FROM batches WHERE id = ?";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->execute([$id]);
    if (!$check_stmt->fetch()) {
        throw new Exception('Batch not found');
    }

    // Verify if teacher exists
    $teacher_check = $db->prepare("SELECT id FROM users WHERE id = ? AND role = 'teacher'");
    $teacher_check->execute([$data['teacher_id']]);
    if (!$teacher_check->fetch()) {
        throw new Exception('Invalid teacher_id');
    }

    // Update batch
    $query = "UPDATE batches SET 
              name = :name,
              description = :description,
              level = :level,
              schedule = :schedule,
              max_students = :max_students,
              teacher_id = :teacher_id,
              status = :status
              WHERE id = :id";

    $stmt = $db->prepare($query);
    
    $result = $stmt->execute([
        'id' => $id,
        'name' => $data['name'],
        'description' => $data['description'] ?? '',
        'level' => $data['level'],
        'schedule' => $data['schedule'],
        'max_students' => (int)$data['max_students'],
        'teacher_id' => (int)$data['teacher_id'],
        'status' => $data['status']
    ]);
    
    if ($result) {
        // Fetch updated batch with teacher name
        $fetch_query = "SELECT b.*, u.full_name as teacher_name,
                       (SELECT COUNT(*) FROM batch_students 
                        WHERE batch_id = b.id AND status = 'active') as current_students
                       FROM batches b 
                       LEFT JOIN users u ON b.teacher_id = u.id 
                       WHERE b.id = ?";
        $stmt = $db->prepare($fetch_query);
        $stmt->execute([$id]);
        $batch = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Batch updated successfully',
            'batch' => $batch
        ]);
    } else {
        throw new Exception('Failed to update batch');
    }

} catch (Exception $e) {
    error_log("Update Batch Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update batch: ' . $e->getMessage()
    ]);
}
?>
