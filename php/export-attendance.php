<?php
require_once 'config.php';
require_once 'vendor/autoload.php'; // Make sure to install TCPDF and PhpSpreadsheet via composer
session_start();

// Verify teacher is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$teacher_id = $_SESSION['user_id'];
$format = $_GET['format'] ?? 'PDF';
$start_date = $_GET['start_date'] ?? date('Y-m-01'); // First day of current month
$end_date = $_GET['end_date'] ?? date('Y-m-t'); // Last day of current month

try {
    $query = "SELECT u.name, a.date, a.status 
              FROM attendance a
              INNER JOIN users u ON u.id = a.student_id
              INNER JOIN classes c ON c.id = a.class_id
              WHERE c.teacher_id = ? 
              AND a.date BETWEEN ? AND ?
              ORDER BY u.name, a.date";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iss", $teacher_id, $start_date, $end_date);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $attendance_data = [];
    while ($row = $result->fetch_assoc()) {
        $attendance_data[] = $row;
    }

    if ($format === 'PDF') {
        // Generate PDF using TCPDF
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->SetTitle('Attendance Report');
        $pdf->AddPage();
        
        // Add header
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 10, 'Attendance Report', 0, 1, 'C');
        $pdf->SetFont('helvetica', '', 12);
        
        // Add attendance table
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(60, 7, 'Name', 1);
        $pdf->Cell(60, 7, 'Date', 1);
        $pdf->Cell(60, 7, 'Status', 1);
        $pdf->Ln();
        
        $pdf->SetFont('helvetica', '', 12);
        foreach ($attendance_data as $row) {
            $pdf->Cell(60, 7, $row['name'], 1);
            $pdf->Cell(60, 7, $row['date'], 1);
            $pdf->Cell(60, 7, ucfirst($row['status']), 1);
            $pdf->Ln();
        }
        
        $pdf->Output('attendance_report.pdf', 'D');
        
    } else if ($format === 'Excel') {
        // Generate Excel using PhpSpreadsheet
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Add header
        $sheet->setCellValue('A1', 'Attendance Report');
        
        // Add column headers
        $sheet->setCellValue('A2', 'Name');
        $sheet->setCellValue('B2', 'Date');
        $sheet->setCellValue('C2', 'Status');
        
        // Add data
        $row = 3;
        foreach ($attendance_data as $data) {
            $sheet->setCellValue('A' . $row, $data['name']);
            $sheet->setCellValue('B' . $row, $data['date']);
            $sheet->setCellValue('C' . $row, ucfirst($data['status']));
            $row++;
        }
        
        // Auto-size columns
        foreach (range('A', 'C') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        // Create Excel file
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="attendance_report.xlsx"');
        header('Cache-Control: max-age=0');
        $writer->save('php://output');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Export error: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
