<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/Database.php';

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Batch ID is required']);
        exit;
    }
    
    try {
        $database = new Database();
        $db = $database->getConnection();

        $query = "UPDATE batches 
                  SET name = :name, 
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
            'description' => $data['description'],
            'level' => $data['level'],
            'schedule' => $data['schedule'],
            'max_students' => $data['max_students'],
            'teacher_id' => $data['teacher_id'],
            'status' => $data['status']
        ]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Batch updated successfully']);
        } else {
            throw new Exception('Failed to update batch');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
