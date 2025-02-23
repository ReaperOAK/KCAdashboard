<?php
require_once '../middleware/auth.php';
require_once '../config/Database.php';
require_once '../vendor/autoload.php'; // For PDF generation

$user_id = validateToken();
$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $batch_id = $_GET['batch_id'] ?? 'all';
        $start_date = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $end_date = $_GET['end_date'] ?? date('Y-m-d');
        $format = $_GET['format'] ?? 'pdf';

        // Fetch attendance data
        $query = "SELECT 
                    a.*, 
                    u.full_name as student_name,
                    b.name as batch_name,
                    bs.date_time as session_date
                 FROM attendance a
                 JOIN users u ON a.student_id = u.id
                 JOIN batches b ON a.batch_id = b.id
                 JOIN batch_sessions bs ON a.session_id = bs.id
                 WHERE (:batch_id = 'all' OR a.batch_id = :batch_id)
                 AND bs.date_time BETWEEN :start_date AND :end_date
                 ORDER BY bs.date_time DESC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            'batch_id' => $batch_id,
            'start_date' => $start_date,
            'end_date' => $end_date
        ]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Generate report based on format
        switch($format) {
            case 'pdf':
                generatePDFReport($results);
                break;
            case 'csv':
                generateCSVReport($results);
                break;
            default:
                throw new Exception('Unsupported export format');
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function generatePDFReport($data) {
    // Use TCPDF or similar library to generate PDF
    $pdf = new TCPDF();
    $pdf->AddPage();
    
    // Add header
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 10, 'Attendance Report', 0, 1, 'C');
    
    // Add data
    $pdf->SetFont('helvetica', '', 12);
    foreach ($data as $row) {
        $pdf->Cell(0, 10, 
            $row['student_name'] . ' - ' . 
            $row['batch_name'] . ' - ' . 
            $row['status'] . ' - ' . 
            date('Y-m-d H:i', strtotime($row['session_date'])), 
            0, 1
        );
    }
    
    $pdf->Output('attendance_report.pdf', 'D');
}

function generateCSVReport($data) {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="attendance_report.csv"');
    
    $output = fopen('php://output', 'w');
    
    // Add headers
    fputcsv($output, ['Student Name', 'Batch', 'Status', 'Session Date', 'Notes']);
    
    // Add data
    foreach ($data as $row) {
        fputcsv($output, [
            $row['student_name'],
            $row['batch_name'],
            $row['status'],
            $row['session_date'],
            $row['notes']
        ]);
    }
    
    fclose($output);
}
?>
