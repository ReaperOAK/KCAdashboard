<?php
// api/endpoints/classroom/get-meetings.php
// Get video conference meetings for a batch or teacher

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/Classroom.php';

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Verify JWT token
$user = verifyToken();
if (!$user) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized'
    ]);
    exit();
}

// Database connection
$database = new Database();
$db = $database->connect();
$classroom = new Classroom($db);

// Get query parameters
$batchId = isset($_GET['batch_id']) ? $_GET['batch_id'] : null;
$teacherId = isset($_GET['teacher_id']) ? $_GET['teacher_id'] : null;
$includeCompleted = isset($_GET['include_completed']) && $_GET['include_completed'] === 'true';

// At least one filter is required
if (!$batchId && !$teacherId) {
    echo json_encode([
        'success' => false,
        'message' => 'At least one filter (batch_id or teacher_id) is required'
    ]);
    exit();
}

// Get meetings based on provided filters
if ($batchId) {
    // Ensure user has access to this batch
    if ($user['role'] === 'student') {
        // For students, verify they belong to this batch
        if (!$classroom->isStudentInBatch($user['id'], $batchId)) {
            echo json_encode([
                'success' => false,
                'message' => 'Access denied. You are not a member of this batch.'
            ]);
            exit();
        }
    }
    
    $meetings = $classroom->getMeetingsByBatch($batchId, $includeCompleted);
} elseif ($teacherId) {
    // For viewing a teacher's meetings
    // Admin can view any teacher's meetings
    // Teachers can only view their own meetings
    // Students can view meetings from their teachers
    
    if ($user['role'] === 'teacher' && $user['id'] != $teacherId) {
        echo json_encode([
            'success' => false,
            'message' => 'Access denied. You can only view your own meetings.'
        ]);
        exit();
    }
    
    if ($user['role'] === 'student') {
        // For students, verify the teacher teaches a batch they belong to
        if (!$classroom->isTeacherForStudent($teacherId, $user['id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Access denied. This teacher is not associated with your batches.'
            ]);
            exit();
        }
    }
    
    $meetings = $classroom->getMeetingsByTeacher($teacherId, $includeCompleted);
}

// Return meetings with teacher and batch info
$result = [];
foreach ($meetings as $meeting) {
    // Get teacher details
    $teacherDetails = $classroom->getTeacherDetails($meeting['teacher_id']);
    // Get batch details
    $batchDetails = $classroom->getBatchDetails($meeting['batch_id']);
    
    // Add additional information
    $meeting['teacher'] = $teacherDetails;
    $meeting['batch'] = $batchDetails;
    
    // Check if meeting is active (15 minutes before until end of duration)
    $scheduledTime = new DateTime($meeting['scheduled_time']);
    $endTime = clone $scheduledTime;
    $endTime->add(new DateInterval('PT' . $meeting['duration_minutes'] . 'M'));
    $now = new DateTime();
    
    // Meeting is active 15 minutes before start time until end time
    $bufferTime = clone $scheduledTime;
    $bufferTime->sub(new DateInterval('PT15M'));
    
    $meeting['is_active'] = ($now >= $bufferTime && $now <= $endTime);
    $meeting['is_completed'] = ($now > $endTime);
    $meeting['can_join'] = $meeting['is_active'] && !$meeting['is_completed'];
    
    $result[] = $meeting;
}

// Return success response with meetings
echo json_encode([
    'success' => true,
    'meetings' => $result
]);
?>