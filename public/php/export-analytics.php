<?php
require_once 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

$format = $_POST['format'] ?? '';
if (!in_array($format, ['PDF', 'Excel'])) {
    http_response_code(400);
    exit('Invalid format specified');
}

try {
    // Fetch the data (reusing queries from get-analytics-data.php)
    $attendanceQuery = "
        SELECT 
            DATE_FORMAT(date, '%Y-%m') as month,
            ROUND(AVG(CASE WHEN status = 'present' THEN 100 ELSE 0 END), 2) as average
        FROM attendance
        WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month ASC
    ";
    
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

    $attendanceResult = $conn->query($attendanceQuery);
    $gradesResult = $conn->query($gradesQuery);

    if ($format === 'Excel') {
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment; filename="analytics_report.xls"');
        
        echo "Attendance Trends\n\n";
        echo "Month\tAverage Attendance (%)\n";
        while ($row = $attendanceResult->fetch_assoc()) {
            echo date('M Y', strtotime($row['month'] . '-01')) . "\t" . $row['average'] . "\n";
        }
        
        echo "\n\nGrades by Subject\n\n";
        echo "Subject\tAverage Grade\n";
        while ($row = $gradesResult->fetch_assoc()) {
            echo $row['subject'] . "\t" . $row['average'] . "\n";
        }
    } else { // PDF
        require_once('tcpdf/tcpdf.php'); // Make sure to include TCPDF library
        
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->SetCreator('Chess Academy Dashboard');
        $pdf->SetTitle('Analytics Report');
        $pdf->AddPage();
        
        // Add content to PDF
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 10, 'Analytics Report', 0, 1, 'C');
        
        // Output PDF
        $pdf->Output('analytics_report.pdf', 'D');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to generate export',
        'debug' => $e->getMessage() // Remove this in production
    ]);
}

$conn->close();
