<?php
// api/endpoints/classroom/update-meeting-link.php
// Update the Google Meet or Zoom link for a batch

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/Classroom.php';

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
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

// Only teachers and admins can update meeting links
if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'message' => 'Permission denied. Only teachers and admins can update meeting links.'
    ]);
    exit();
}

// Get raw posted data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['batch_id']) || !isset($data['meeting_link'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: batch_id, meeting_link'
    ]);
    exit();
}

// Check if the Google Meet link is valid
if (isset($data['meeting_link']) && !empty($data['meeting_link'])) {
    // Simple validation - make sure it's a Google Meet or Zoom link
    if (strpos($data['meeting_link'], 'meet.google.com') === false 
        && strpos($data['meeting_link'], 'zoom.us') === false) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid meeting link. Only Google Meet or Zoom links are supported.'
        ]);
        exit();
    }
}

// Database connection and model initialization
$database = new Database();
$db = $database->connect();
$classroom = new Classroom($db);

// Determine platform based on link
$platform = 'google_meet'; // Default
if (strpos($data['meeting_link'], 'zoom.us') !== false) {
    $platform = 'zoom';
}

// Check if teacher has access to the batch (if not admin)
if ($user['role'] === 'teacher') {
    $query = "SELECT 1 FROM batches WHERE id = :batch_id AND teacher_id = :teacher_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':batch_id', $data['batch_id']);
    $stmt->bindParam(':teacher_id', $user['id']);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Permission denied. You are not the teacher for this batch.'
        ]);
        exit();
    }
}

// Update the meeting link
$result = $classroom->updateBatchMeetingLink(
    $data['batch_id'],
    $data['meeting_link'],
    $platform
);

if ($result) {
    echo json_encode([
        'success' => true,
        'message' => 'Meeting link updated successfully',
        'data' => [
            'batch_id' => $data['batch_id'],
            'meeting_link' => $data['meeting_link'],
            'platform' => $platform
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update meeting link'
    ]);
}
?>