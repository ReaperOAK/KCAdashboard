<?php
require_once 'config.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT 
                DATE_FORMAT(a.date, '%Y-%m') as month,
                AVG(CASE 
                    WHEN a.status = 'present' THEN 100 
                    WHEN a.status = 'absent' THEN 0 
                END) as average
            FROM attendance a
            WHERE a.date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(a.date, '%Y-%m')
            ORDER BY month DESC";

    $result = $conn->query($sql);
    $overview = [];

    while ($row = $result->fetch_assoc()) {
        $overview[] = [
            'month' => date('F Y', strtotime($row['month'] . '-01')),
            'average' => round($row['average'] ?? 0, 2)
        ];
    }

    echo json_encode($overview);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>
