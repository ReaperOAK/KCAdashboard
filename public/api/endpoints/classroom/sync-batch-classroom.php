<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
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

    // Only admins and teachers can run sync
    if (!in_array($user['role'], ['admin', 'teacher'])) {
        throw new Exception('Only admins and teachers can run batch-classroom sync');
    }

    $database = new Database();
    $db = $database->getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Run the sync operation
        $db->beginTransaction();
        
        $sync_results = [
            'batches_processed' => 0,
            'students_synced' => 0,
            'classrooms_created' => 0,
            'errors' => [],
            'details' => []
        ];
        
        // Get all batches (filter by teacher if not admin)
        if ($user['role'] === 'teacher') {
            $batch_query = "SELECT * FROM batches WHERE teacher_id = :teacher_id AND status = 'active'";
            $batch_stmt = $db->prepare($batch_query);
            $batch_stmt->bindParam(':teacher_id', $user['id']);
        } else {
            $batch_query = "SELECT * FROM batches WHERE status = 'active'";
            $batch_stmt = $db->prepare($batch_query);
        }
        
        $batch_stmt->execute();
        $batches = $batch_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($batches as $batch) {
            $sync_results['batches_processed']++;
            $batch_detail = [
                'batch_id' => $batch['id'],
                'batch_name' => $batch['name'],
                'teacher_id' => $batch['teacher_id'],
                'classroom_found' => false,
                'classroom_created' => false,
                'students_synced' => 0
            ];
            
            try {
                // Find corresponding classroom
                $classroom_query = "SELECT id FROM classrooms 
                                  WHERE teacher_id = :teacher_id AND name = :batch_name";
                $classroom_stmt = $db->prepare($classroom_query);
                $classroom_stmt->bindParam(':teacher_id', $batch['teacher_id']);
                $classroom_stmt->bindParam(':batch_name', $batch['name']);
                $classroom_stmt->execute();
                
                $classroom_id = null;
                if ($classroom_stmt->rowCount() > 0) {
                    $classroom = $classroom_stmt->fetch(PDO::FETCH_ASSOC);
                    $classroom_id = $classroom['id'];
                    $batch_detail['classroom_found'] = true;
                    $batch_detail['classroom_id'] = $classroom_id;
                } else {
                    // Create classroom with same name as batch
                    $create_classroom_query = "INSERT INTO classrooms (name, description, teacher_id, status, created_at)
                                             VALUES (:name, :description, :teacher_id, 'active', NOW())";
                    $create_stmt = $db->prepare($create_classroom_query);
                    $create_stmt->bindParam(':name', $batch['name']);
                    $create_stmt->bindParam(':description', $batch['description'] ?: ($batch['name'] . ' - Synced from batch'));
                    $create_stmt->bindParam(':teacher_id', $batch['teacher_id']);
                    
                    if ($create_stmt->execute()) {
                        $classroom_id = $db->lastInsertId();
                        $batch_detail['classroom_created'] = true;
                        $batch_detail['classroom_id'] = $classroom_id;
                        $sync_results['classrooms_created']++;
                    }
                }
                
                if ($classroom_id) {
                    // Get all students in this batch
                    $students_query = "SELECT student_id FROM batch_students WHERE batch_id = :batch_id";
                    $students_stmt = $db->prepare($students_query);
                    $students_stmt->bindParam(':batch_id', $batch['id']);
                    $students_stmt->execute();
                    $batch_students = $students_stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    foreach ($batch_students as $batch_student) {
                        $student_id = $batch_student['student_id'];
                          // Check if student is already in classroom
                        $check_query = "SELECT classroom_id FROM classroom_students 
                                      WHERE classroom_id = :classroom_id AND student_id = :student_id";
                        $check_stmt = $db->prepare($check_query);
                        $check_stmt->bindParam(':classroom_id', $classroom_id);
                        $check_stmt->bindParam(':student_id', $student_id);
                        $check_stmt->execute();
                        
                        if ($check_stmt->rowCount() == 0) {
                            // Add student to classroom
                            $add_query = "INSERT INTO classroom_students (classroom_id, student_id, joined_at)
                                        VALUES (:classroom_id, :student_id, NOW())";
                            $add_stmt = $db->prepare($add_query);
                            $add_stmt->bindParam(':classroom_id', $classroom_id);
                            $add_stmt->bindParam(':student_id', $student_id);
                            
                            if ($add_stmt->execute()) {
                                $batch_detail['students_synced']++;
                                $sync_results['students_synced']++;
                            }
                        }
                    }
                }
                
            } catch (Exception $e) {
                $sync_results['errors'][] = "Error processing batch {$batch['name']}: " . $e->getMessage();
                $batch_detail['error'] = $e->getMessage();
            }
            
            $sync_results['details'][] = $batch_detail;
        }
        
        $db->commit();
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Batch-classroom sync completed',
            'results' => $sync_results
        ], JSON_PRETTY_PRINT);
        
    } else {
        // GET request - show what would be synced
        $preview = [
            'batches_to_process' => [],
            'total_batches' => 0,
            'total_students_in_batches' => 0,
            'sync_needed' => []
        ];
        
        // Get all batches (filter by teacher if not admin)
        if ($user['role'] === 'teacher') {
            $batch_query = "SELECT b.*, COUNT(bs.student_id) as student_count 
                          FROM batches b 
                          LEFT JOIN batch_students bs ON b.id = bs.batch_id 
                          WHERE b.teacher_id = :teacher_id AND b.status = 'active'
                          GROUP BY b.id";
            $batch_stmt = $db->prepare($batch_query);
            $batch_stmt->bindParam(':teacher_id', $user['id']);
        } else {
            $batch_query = "SELECT b.*, COUNT(bs.student_id) as student_count 
                          FROM batches b 
                          LEFT JOIN batch_students bs ON b.id = bs.batch_id 
                          WHERE b.status = 'active'
                          GROUP BY b.id";
            $batch_stmt = $db->prepare($batch_query);
        }
        
        $batch_stmt->execute();
        $batches = $batch_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($batches as $batch) {
            $preview['total_batches']++;
            $preview['total_students_in_batches'] += $batch['student_count'];
            
            // Check if corresponding classroom exists
            $classroom_query = "SELECT id FROM classrooms 
                              WHERE teacher_id = :teacher_id AND name = :batch_name";
            $classroom_stmt = $db->prepare($classroom_query);
            $classroom_stmt->bindParam(':teacher_id', $batch['teacher_id']);
            $classroom_stmt->bindParam(':batch_name', $batch['name']);
            $classroom_stmt->execute();
            
            $batch_info = [
                'batch_id' => $batch['id'],
                'batch_name' => $batch['name'],
                'student_count' => $batch['student_count'],
                'has_corresponding_classroom' => $classroom_stmt->rowCount() > 0,
                'needs_sync' => false
            ];
            
            if (!$batch_info['has_corresponding_classroom']) {
                $batch_info['needs_sync'] = true;
                $preview['sync_needed'][] = $batch_info;
            }
            
            $preview['batches_to_process'][] = $batch_info;
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'preview' => $preview,
            'instructions' => 'Send a POST request to this endpoint to run the sync'
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollback();
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
