<?php
require_once '../../config/cors.php';

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    $requested_id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$requested_id) {
        throw new Exception('ID is required');
    }

    $database = new Database();
    $db = $database->getConnection();
    
    $response = [
        'user_id' => $user['id'],
        'requested_id' => $requested_id,
        'type_detected' => null,
        'redirect_to' => null,
        'message' => null
    ];
    
    // First, check if it's a valid classroom ID
    $classroom_query = "SELECT * FROM classrooms WHERE id = :id";
    $classroom_stmt = $db->prepare($classroom_query);
    $classroom_stmt->bindParam(':id', $requested_id);
    $classroom_stmt->execute();
    $classroom = $classroom_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($classroom) {
        $response['type_detected'] = 'classroom';
        $response['classroom_details'] = $classroom;
        
        // Check if user has access to this classroom
        if ($user['role'] === 'student') {
            $access_query = "SELECT * FROM classroom_students WHERE classroom_id = :id AND student_id = :user_id";
            $access_stmt = $db->prepare($access_query);
            $access_stmt->bindParam(':id', $requested_id);
            $access_stmt->bindParam(':user_id', $user['id']);
            $access_stmt->execute();
            
            if ($access_stmt->rowCount() > 0) {
                $response['message'] = 'You have access to this classroom';
                $response['redirect_to'] = $requested_id;
            } else {
                $response['message'] = 'You do not have access to this classroom';
            }
        }
    } else {
        // Check if it's a batch ID
        $batch_query = "SELECT * FROM batches WHERE id = :id";
        $batch_stmt = $db->prepare($batch_query);
        $batch_stmt->bindParam(':id', $requested_id);
        $batch_stmt->execute();
        $batch = $batch_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($batch) {
            $response['type_detected'] = 'batch';
            $response['batch_details'] = $batch;
            
            // Check if user is in this batch
            if ($user['role'] === 'student') {
                $batch_access_query = "SELECT * FROM batch_students WHERE batch_id = :id AND student_id = :user_id";
                $batch_access_stmt = $db->prepare($batch_access_query);
                $batch_access_stmt->bindParam(':id', $requested_id);
                $batch_access_stmt->bindParam(':user_id', $user['id']);
                $batch_access_stmt->execute();
                
                if ($batch_access_stmt->rowCount() > 0) {
                    // Find corresponding classroom
                    $corresponding_classroom_query = "SELECT id FROM classrooms 
                                                    WHERE teacher_id = :teacher_id AND name = :batch_name";
                    $corr_stmt = $db->prepare($corresponding_classroom_query);
                    $corr_stmt->bindParam(':teacher_id', $batch['teacher_id']);
                    $corr_stmt->bindParam(':batch_name', $batch['name']);
                    $corr_stmt->execute();
                    
                    if ($corr_stmt->rowCount() > 0) {
                        $classroom_match = $corr_stmt->fetch(PDO::FETCH_ASSOC);
                        $response['message'] = 'Batch ID provided, redirecting to corresponding classroom';
                        $response['redirect_to'] = $classroom_match['id'];
                        $response['corresponding_classroom_id'] = $classroom_match['id'];
                    } else {
                        $response['message'] = 'You are in this batch, but no corresponding classroom found';
                        $response['needs_classroom_creation'] = true;
                    }
                } else {
                    $response['message'] = 'You are not enrolled in this batch';
                }
            }
        } else {
            $response['type_detected'] = 'unknown';
            $response['message'] = 'ID does not match any classroom or batch';
        }
    }
    
    // Additional info: Show all classrooms user has access to
    if ($user['role'] === 'student') {
        $user_classrooms_query = "SELECT c.*, cs.joined_at 
                                FROM classrooms c 
                                JOIN classroom_students cs ON c.id = cs.classroom_id 
                                WHERE cs.student_id = :user_id";
        $user_classrooms_stmt = $db->prepare($user_classrooms_query);
        $user_classrooms_stmt->bindParam(':user_id', $user['id']);
        $user_classrooms_stmt->execute();
        $response['user_classrooms'] = $user_classrooms_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $user_batches_query = "SELECT b.*, bs.joined_at 
                             FROM batches b 
                             JOIN batch_students bs ON b.id = bs.batch_id 
                             WHERE bs.student_id = :user_id";
        $user_batches_stmt = $db->prepare($user_batches_query);
        $user_batches_stmt->bindParam(':user_id', $user['id']);
        $user_batches_stmt->execute();
        $response['user_batches'] = $user_batches_stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
