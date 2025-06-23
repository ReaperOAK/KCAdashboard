<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Validate user auth token
    $user = getAuthUser();
    if (!$user) {
        throw new Exception('Unauthorized access');
    }

    $classroom_id = isset($_GET['classroom_id']) ? $_GET['classroom_id'] : null;
    
    $database = new Database();
    $db = $database->getConnection();
    
    $response = [
        'user' => $user,
        'classroom_id' => $classroom_id
    ];
    
    if ($classroom_id) {
        // Get classroom details
        $query = "SELECT * FROM classrooms WHERE id = :classroom_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':classroom_id', $classroom_id);
        $stmt->execute();
        $classroom = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response['classroom'] = $classroom;
        
        if ($classroom) {
            $teacher_id = $classroom['teacher_id'];
            
            // Get all batches by this teacher
            $batch_query = "SELECT * FROM batches WHERE teacher_id = :teacher_id ORDER BY created_at DESC";
            $batch_stmt = $db->prepare($batch_query);
            $batch_stmt->bindParam(':teacher_id', $teacher_id);
            $batch_stmt->execute();
            $response['teacher_batches'] = $batch_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get all classrooms by this teacher
            $classroom_query = "SELECT * FROM classrooms WHERE teacher_id = :teacher_id ORDER BY created_at DESC";
            $classroom_stmt = $db->prepare($classroom_query);
            $classroom_stmt->bindParam(':teacher_id', $teacher_id);
            $classroom_stmt->execute();
            $response['teacher_classrooms'] = $classroom_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Check for matching names between batches and classrooms
            $matching_pairs = [];
            foreach ($response['teacher_batches'] as $batch) {
                foreach ($response['teacher_classrooms'] as $room) {
                    if ($batch['name'] === $room['name']) {
                        $matching_pairs[] = [
                            'batch_id' => $batch['id'],
                            'classroom_id' => $room['id'],
                            'name' => $batch['name']
                        ];
                    }
                }
            }
            $response['matching_batch_classroom_pairs'] = $matching_pairs;
            
            // Get students in the specific classroom
            $students_query = "SELECT cs.*, u.full_name, u.email 
                              FROM classroom_students cs 
                              JOIN users u ON cs.student_id = u.id 
                              WHERE cs.classroom_id = :classroom_id";
            $students_stmt = $db->prepare($students_query);
            $students_stmt->bindParam(':classroom_id', $classroom_id);
            $students_stmt->execute();
            $response['classroom_students'] = $students_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Check if there's a corresponding batch for this classroom
            $corresponding_batch_query = "SELECT b.*, COUNT(bs.student_id) as student_count
                                         FROM batches b 
                                         LEFT JOIN batch_students bs ON b.id = bs.batch_id
                                         WHERE b.teacher_id = :teacher_id AND b.name = :classroom_name
                                         GROUP BY b.id";
            $corr_batch_stmt = $db->prepare($corresponding_batch_query);
            $corr_batch_stmt->bindParam(':teacher_id', $teacher_id);
            $corr_batch_stmt->bindParam(':classroom_name', $classroom['name']);
            $corr_batch_stmt->execute();
            $corresponding_batch = $corr_batch_stmt->fetch(PDO::FETCH_ASSOC);
            $response['corresponding_batch'] = $corresponding_batch;
            
            if ($corresponding_batch) {
                // Get students in the corresponding batch
                $batch_students_query = "SELECT bs.*, u.full_name, u.email 
                                        FROM batch_students bs 
                                        JOIN users u ON bs.student_id = u.id 
                                        WHERE bs.batch_id = :batch_id";
                $batch_students_stmt = $db->prepare($batch_students_query);
                $batch_students_stmt->bindParam(':batch_id', $corresponding_batch['id']);
                $batch_students_stmt->execute();
                $response['batch_students'] = $batch_students_stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        }
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
