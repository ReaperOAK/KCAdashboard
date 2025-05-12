<?php
// api/endpoints/classroom/create-meeting.php
// Create a new video conference meeting (Zoom or Google Meet)

require_once '../../config/Database.php';
require_once '../../middleware/auth.php';
require_once '../../models/Classroom.php';
require_once '../../models/User.php';
require_once '../../services/NotificationService.php';

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

// Only teachers and admins can create meetings
if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
    echo json_encode([
        'success' => false,
        'message' => 'Permission denied. Only teachers and admins can create meetings.'
    ]);
    exit();
}

// Get raw posted data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['title']) || !isset($data['batch_id']) || !isset($data['platform']) || !isset($data['scheduled_time'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: title, batch_id, platform, scheduled_time'
    ]);
    exit();
}

// Database connection and model initialization
$database = new Database();
$db = $database->connect();
$classroom = new Classroom($db);
$userModel = new User($db);
$notificationService = new NotificationService();

// Set meeting properties
$classroom->teacher_id = $user['id'];
$classroom->batch_id = $data['batch_id'];
$classroom->title = $data['title'];
$classroom->platform = $data['platform']; // 'zoom' or 'google_meet'
$classroom->scheduled_time = $data['scheduled_time'];
$classroom->description = $data['description'] ?? '';
$classroom->duration_minutes = $data['duration_minutes'] ?? 60;

// Platform-specific settings
if ($data['platform'] === 'zoom') {
    // For demo purposes, we're not actually creating a Zoom meeting via API
    // In a production environment, you would make an API call to Zoom
    $classroom->meeting_link = generateMockZoomLink();
    $classroom->meeting_id = 'zoom_' . rand(1000000000, 9999999999);
    $classroom->meeting_password = generateRandomPassword();
} elseif ($data['platform'] === 'google_meet') {
    // For demo purposes, we're not actually creating a Google Meet meeting via API
    // In a production environment, you would make an API call to Google Calendar API
    $classroom->meeting_link = generateMockGoogleMeetLink();
    $classroom->meeting_id = 'gmeet_' . rand(1000000000, 9999999999);
    $classroom->meeting_password = ''; // Google Meet doesn't typically use passwords
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid platform. Supported platforms: zoom, google_meet'
    ]);
    exit();
}

// Create the meeting record in the database
if ($classroom->createMeeting()) {
    $meetingId = $db->lastInsertId();
    
    // Get students in the batch to send notifications
    $studentIds = $classroom->getBatchStudentIds($data['batch_id']);
    
    // Send notifications to all students in the batch
    if (!empty($studentIds)) {
        $notificationParams = [
            'class_name' => $data['title'],
            'time' => date('h:i A', strtotime($data['scheduled_time'])),
            'date' => date('M d, Y', strtotime($data['scheduled_time'])),
        ];
        
        $meetingLink = "/student/classroom/meeting/{$meetingId}";
        $notificationService->sendBulkFromTemplate(
            $studentIds,
            'class_reminder',
            $notificationParams,
            true, // Send email
            $meetingLink
        );
    }
    
    // Return success with meeting details
    echo json_encode([
        'success' => true,
        'message' => 'Meeting created successfully',
        'meeting' => [
            'id' => $meetingId,
            'teacher_id' => $user['id'],
            'batch_id' => $classroom->batch_id,
            'title' => $classroom->title,
            'platform' => $classroom->platform,
            'scheduled_time' => $classroom->scheduled_time,
            'description' => $classroom->description,
            'duration_minutes' => $classroom->duration_minutes,
            'meeting_link' => $classroom->meeting_link,
            'meeting_id' => $classroom->meeting_id,
            'meeting_password' => $classroom->meeting_password
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create meeting'
    ]);
}

// Helper functions to generate mock meeting links

function generateMockZoomLink() {
    $randomId = rand(10000000000, 99999999999);
    return "https://zoom.us/j/{$randomId}";
}

function generateMockGoogleMeetLink() {
    $chars = 'abcdefghijklmnopqrstuvwxyz';
    $randomCode = '';
    for ($i = 0; $i < 3; $i++) {
        $randomCode .= $chars[rand(0, strlen($chars) - 1)];
    }
    for ($i = 0; $i < 4; $i++) {
        $randomCode .= $chars[rand(0, strlen($chars) - 1)];
    }
    for ($i = 0; $i < 3; $i++) {
        $randomCode .= $chars[rand(0, strlen($chars) - 1)];
    }
    return "https://meet.google.com/{$randomCode}";
}

function generateRandomPassword() {
    return rand(100000, 999999);
}
?>