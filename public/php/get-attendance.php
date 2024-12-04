<?php
header('Content-Type: application/json');
include 'config.php'; // Include your database configuration file

// Function to fetch attendance data for a student
function getAttendance($conn, $studentId) {
    $query = "SELECT status, date FROM attendance WHERE student_id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        error_log("Prepare failed: " . $conn->error);
        return null;
    }
    $stmt->bind_param("i", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result) {
        error_log("Database query failed: " . $stmt->error);
        return null;
    }
    $events = [];
    $attendance = ['present' => 0, 'absent' => 0];
    while ($row = $result->fetch_assoc()) {
        $events[] = [
            'title' => ucfirst($row['status']),
            'start' => $row['date'],
            'color' => $row['status'] === 'present' ? 'green' : ($row['status'] === 'absent' ? 'red' : 'gray')
        ];
        if ($row['status'] === 'present') {
            $attendance['present']++;
        } else if ($row['status'] === 'absent') {
            $attendance['absent']++;
        }
    }
    $totalClasses = $attendance['present'] + $attendance['absent'];
    $percentage = $totalClasses > 0 ? ($attendance['present'] / $totalClasses) * 100 : 0;
    return ['events' => $events, 'percentage' => $percentage];
}

$studentId = $_COOKIE['user_id'];

// Fetch attendance data for the student
$attendanceData = getAttendance($conn, $studentId);

// Check if data fetching failed
if ($attendanceData === null) {
    echo json_encode(['success' => false, 'message' => 'Error fetching attendance data']);
    exit;
}

// Return the fetched data as JSON
echo json_encode([
    'success' => true,
    'events' => $attendanceData['events'],
    'percentage' => $attendanceData['percentage']
]);

mysqli_close($conn);
?>