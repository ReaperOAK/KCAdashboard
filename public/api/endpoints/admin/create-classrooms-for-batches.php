<?php
header('Content-Type: application/json');
require_once '../../config/Database.php';
require_once '../../utils/authorize.php';

try {
    // Only admins can run this migration
    $user = authorize(['admin']);
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Start transaction
    $db->beginTransaction();
    
    // Get all batches that don't have corresponding classrooms
    $query = "SELECT b.id, b.name, b.description, b.level, b.schedule, b.teacher_id, b.created_at
              FROM batches b
              LEFT JOIN classrooms c ON (c.teacher_id = b.teacher_id AND c.name = b.name)
              WHERE c.id IS NULL";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $batches_without_classrooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $created_count = 0;
    
    foreach ($batches_without_classrooms as $batch) {
        // Create classroom for this batch
        $classroom_query = "INSERT INTO classrooms 
                          (name, description, level, schedule, teacher_id, status, created_at)
                          VALUES (:name, :description, :level, :schedule, :teacher_id, 'active', :created_at)";
        
        $classroom_stmt = $db->prepare($classroom_query);
        $classroom_stmt->bindParam(':name', $batch['name']);
        $classroom_stmt->bindParam(':description', $batch['description']);
        $classroom_stmt->bindParam(':level', $batch['level']);
        $classroom_stmt->bindParam(':schedule', $batch['schedule']);
        $classroom_stmt->bindParam(':teacher_id', $batch['teacher_id']);
        $classroom_stmt->bindParam(':created_at', $batch['created_at']);
        
        if ($classroom_stmt->execute()) {
            $created_count++;
            
            // Get the newly created classroom ID
            $classroom_id = $db->lastInsertId();
            
            // Copy students from batch_students to classroom_students
            $students_query = "INSERT INTO classroom_students (classroom_id, student_id, joined_at, status)
                             SELECT :classroom_id, student_id, joined_at, status
                             FROM batch_students 
                             WHERE batch_id = :batch_id";
            
            $students_stmt = $db->prepare($students_query);
            $students_stmt->bindParam(':classroom_id', $classroom_id);
            $students_stmt->bindParam(':batch_id', $batch['id']);
            $students_stmt->execute();
        }
    }
    
    // Commit transaction
    $db->commit();
    
    http_response_code(200);
    echo json_encode([
        'success' => true, 
        'message' => "Created $created_count classrooms for existing batches",
        'created_count' => $created_count
    ]);
    
} catch(Exception $e) {
    // Rollback on error
    if ($db && $db->inTransaction()) {
        $db->rollback();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Migration failed: ' . $e->getMessage()
    ]);
}
?>
