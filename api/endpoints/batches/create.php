<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/Database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $database = new Database();
        $db = $database->getConnection();

        $query = "INSERT INTO batches (name, description, level, schedule, 
                  max_students, teacher_id, status) 
                  VALUES (:name, :description, :level, :schedule, 
                  :max_students, :teacher_id, :status)";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            'name' => $data['name'],
            'description' => $data['description'],
            'level' => $data['level'],
            'schedule' => $data['schedule'],
            'max_students' => $data['max_students'],
            'teacher_id' => $data['teacher_id'],
            'status' => $data['status']
        ]);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'Batch created successfully']);
        } else {
            throw new Exception('Failed to create batch');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
