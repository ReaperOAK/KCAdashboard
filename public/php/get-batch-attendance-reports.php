<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT 
                b.id as batchId,
                b.name as batchName,
                AVG(CASE 
                    WHEN a.status = 'present' THEN 100 
                    WHEN a.status = 'absent' THEN 0 
                END) as attendancePercentage
            FROM batches b
            LEFT JOIN classes c ON b.id = c.batch_id
            LEFT JOIN attendance a ON c.id = a.class_id
            GROUP BY b.id, b.name";

    $result = $conn->query($sql);
    $reports = [];

    while ($row = $result->fetch_assoc()) {
        $reports[] = [
            'batchId' => $row['batchId'],
            'batchName' => $row['batchName'],
            'attendancePercentage' => round($row['attendancePercentage'] ?? 0, 2)
        ];
    }

    echo json_encode($reports);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
