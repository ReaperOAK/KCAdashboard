<?php
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    $current_user = getAuthUser();
    if (!$current_user) {
        throw new Exception('Unauthorized');
    }
    
    $user_id = $current_user['id'];
    $user_role = $current_user['role'];

    $database = new Database();
    $db = $database->getConnection();
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Only teachers and admins can access this endpoint
    if (!in_array($user_role, ['teacher', 'admin'])) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Only teachers and admins can access shareable entities'
        ]);
        exit();
    }

    // Get teachers, their batches, and students for sharing
    $response = [
        'success' => true,
        'teachers' => [],
        'batches' => [],
        'students' => []
    ];

    // 1. Get all teachers (for sharing with individual teachers)
    $teachers_query = "SELECT id, full_name, email 
                      FROM users 
                      WHERE role = 'teacher' 
                      AND is_active = 1 
                      AND id != ?
                      ORDER BY full_name ASC";
    
    $teachers_stmt = $db->prepare($teachers_query);
    $teachers_stmt->execute([$user_id]);
    
    while ($teacher = $teachers_stmt->fetch(PDO::FETCH_ASSOC)) {
        $response['teachers'][] = [
            'id' => $teacher['id'],
            'name' => $teacher['full_name'],
            'email' => $teacher['email'],
            'type' => 'teacher'
        ];
    }

    // 2. Get all batches (for sharing with entire batches)
    if ($user_role === 'admin') {
        // Admins can share with any batch
        $batches_query = "SELECT b.id, b.name, b.description, b.level, 
                                u.full_name as teacher_name, b.teacher_id,
                                COUNT(bs.student_id) as student_count
                         FROM batches b
                         JOIN users u ON b.teacher_id = u.id
                         LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'active'
                         WHERE b.status = 'active'
                         GROUP BY b.id
                         ORDER BY u.full_name, b.name";
        
        $batches_stmt = $db->prepare($batches_query);
        $batches_stmt->execute();
    } else {
        // Teachers can share with their own batches and other teachers' batches
        $batches_query = "SELECT b.id, b.name, b.description, b.level, 
                                u.full_name as teacher_name, b.teacher_id,
                                COUNT(bs.student_id) as student_count,
                                CASE WHEN b.teacher_id = ? THEN 1 ELSE 0 END as is_own_batch
                         FROM batches b
                         JOIN users u ON b.teacher_id = u.id
                         LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'active'
                         WHERE b.status = 'active'
                         GROUP BY b.id
                         ORDER BY is_own_batch DESC, u.full_name, b.name";
        
        $batches_stmt = $db->prepare($batches_query);
        $batches_stmt->execute([$user_id]);
    }
    
    while ($batch = $batches_stmt->fetch(PDO::FETCH_ASSOC)) {
        $response['batches'][] = [
            'id' => $batch['id'],
            'name' => $batch['name'],
            'description' => $batch['description'],
            'level' => $batch['level'],
            'teacher_name' => $batch['teacher_name'],
            'teacher_id' => $batch['teacher_id'],
            'student_count' => (int)$batch['student_count'],
            'is_own_batch' => isset($batch['is_own_batch']) ? (bool)$batch['is_own_batch'] : false,
            'type' => 'batch'
        ];
    }

    // 3. Get all students (for sharing with individual students)
    $students_query = "SELECT u.id, u.full_name, u.email, 
                             GROUP_CONCAT(b.name SEPARATOR ', ') as batches
                      FROM users u
                      LEFT JOIN batch_students bs ON u.id = bs.student_id AND bs.status = 'active'
                      LEFT JOIN batches b ON bs.batch_id = b.id AND b.status = 'active'
                      WHERE u.role = 'student' 
                      AND u.is_active = 1
                      GROUP BY u.id
                      ORDER BY u.full_name ASC";
    
    $students_stmt = $db->prepare($students_query);
    $students_stmt->execute();
    
    while ($student = $students_stmt->fetch(PDO::FETCH_ASSOC)) {
        $response['students'][] = [
            'id' => $student['id'],
            'name' => $student['full_name'],
            'email' => $student['email'],
            'batches' => $student['batches'] ?: 'No active batches',
            'type' => 'student'
        ];
    }

    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
