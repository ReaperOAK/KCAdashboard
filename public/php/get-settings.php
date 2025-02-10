<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

try {
    // Get personal info and notifications
    $stmt = $conn->prepare("SELECT name, email, profile_picture, missed_class_notifications, assignment_due_notifications FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $userData = $result->fetch_assoc();

    // Get chess settings
    $stmt = $conn->prepare("SELECT lichess_username, preferred_time_control, board_theme, piece_set FROM user_preferences WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $chessData = $stmt->get_result()->fetch_assoc();

    $response = [
        'personalInfo' => [
            'name' => $userData['name'],
            'email' => $userData['email'],
            'profilePicture' => $userData['profile_picture']
        ],
        'notifications' => [
            'missedClass' => (bool)$userData['missed_class_notifications'],
            'assignmentDue' => (bool)$userData['assignment_due_notifications']
        ],
        'chessSettings' => $chessData ?: [
            'lichessUsername' => '',
            'preferredTimeControl' => '10+0',
            'boardTheme' => 'classic',
            'pieceSet' => 'classic'
        ]
    ];

    // Add role-specific settings
    if ($role === 'teacher') {
        $stmt = $conn->prepare("SELECT default_class_duration, auto_record_class, maximum_students_per_batch FROM teacher_settings WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $teacherData = $stmt->get_result()->fetch_assoc();
        $response['teacherSettings'] = $teacherData ?: [
            'defaultClassDuration' => 60,
            'autoRecordClass' => true,
            'maximumStudentsPerBatch' => 10
        ];
    }

    if ($role === 'admin') {
        $stmt = $conn->prepare("SELECT allow_new_registrations, attendance_threshold, auto_send_reminders FROM admin_settings LIMIT 1");
        $stmt->execute();
        $adminData = $stmt->get_result()->fetch_assoc();
        $response['adminSettings'] = $adminData ?: [
            'allowNewRegistrations' => true,
            'attendanceThreshold' => 75,
            'autoSendReminders' => true
        ];
    }

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

$conn->close();
?>
