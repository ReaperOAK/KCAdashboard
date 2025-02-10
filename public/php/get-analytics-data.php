<?php
require_once 'config.php';
header('Content-Type: application/json');

try {
    // Get attendance trends for the last 6 months
    $attendanceQuery = "
        SELECT 
            DATE_FORMAT(date, '%Y-%m') as month,
            ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 2) as average
        FROM attendance
        WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month ASC
    ";
    
    $attendanceResult = $conn->query($attendanceQuery);
    $attendanceTrends = [];
    
    while ($row = $attendanceResult->fetch_assoc()) {
        $attendanceTrends[] = [
            'month' => date('M Y', strtotime($row['month'] . '-01')),
            'average' => floatval($row['average'])
        ];
    }

    // Get average grades by subject
    $gradesQuery = "
        SELECT 
            subject,
            ROUND(AVG(CASE 
                WHEN grade = 'A+' THEN 100
                WHEN grade = 'A' THEN 95
                WHEN grade = 'A-' THEN 90
                WHEN grade = 'B+' THEN 85
                WHEN grade = 'B' THEN 80
                WHEN grade = 'B-' THEN 75
                WHEN grade = 'C+' THEN 70
                WHEN grade = 'C' THEN 65
                WHEN grade = 'C-' THEN 60
                WHEN grade = 'D' THEN 55
                WHEN grade = 'F' THEN 50
            END), 2) as average
        FROM performance
        GROUP BY subject
        ORDER BY average DESC
    ";
    
    $gradesResult = $conn->query($gradesQuery);
    $gradesData = [];
    
    while ($row = $gradesResult->fetch_assoc()) {
        $gradesData[] = [
            'subject' => $row['subject'],
            'average' => floatval($row['average'])
        ];
    }

    // Prepare response
    $response = [
        'status' => 'success',
        'attendanceTrends' => $attendanceTrends,
        'gradesData' => $gradesData
    ];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while fetching analytics data',
        'debug' => $e->getMessage() // Remove this in production
    ]);
}

$conn->close();
