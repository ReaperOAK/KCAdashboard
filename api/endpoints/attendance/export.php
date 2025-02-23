<?php
require_once '../middleware/auth.php';
require_once '../config/Database.php';
require_once '../vendor/autoload.php';

use TCPDF as TCPDF;

$user_id = validateToken();
$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Clean output buffer to prevent any unwanted output
        ob_clean();
        
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
                 AND DATE(bs.date_time) BETWEEN :start_date AND :end_date
                 ORDER BY bs.date_time DESC";

        $stmt = $db->prepare($query);
        $stmt->execute([
            'batch_id' => $batch_id,
            'start_date' => $start_date,
            'end_date' => $end_date
        ]);

        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Ensure no output before this point
        if (ob_get_length()) ob_clean();

        switch($format) {
            case 'pdf':
                // Set headers for PDF
                header('Content-Type: application/pdf');
                header('Content-Disposition: attachment; filename="attendance_report.pdf"');
                header('Cache-Control: private, max-age=0, must-revalidate');
                header('Pragma: public');
                generatePDFReport($results, $start_date, $end_date);
                break;
                
            case 'csv':
                // Set headers for CSV
                header('Content-Type: text/csv; charset=utf-8');
                header('Content-Disposition: attachment; filename="attendance_report.csv"');
                header('Cache-Control: no-cache, must-revalidate');
                header('Pragma: public');
                generateCSVReport($results);
                break;
                
            default:
                throw new Exception('Unsupported export format');
        }

    } catch (Exception $e) {
        // Clear any output that might have been sent
        if (ob_get_length()) ob_clean();
        
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

function generatePDFReport($data, $start_date, $end_date) {
    try {
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

        // Disable default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        // Set document information
        $pdf->SetCreator('KCA Dashboard');
        $pdf->SetAuthor('KCA Admin');
        $pdf->SetTitle('Attendance Report');

        // Set margins
        $pdf->SetMargins(15, 15, 15);

        // Add a page
        $pdf->AddPage();

        // Set font
        $pdf->SetFont('helvetica', '', 10);

        // Title
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 10, 'Attendance Report', 0, 1, 'C');
        $pdf->SetFont('helvetica', '', 12);
        $pdf->Cell(0, 10, "Period: $start_date to $end_date", 0, 1, 'C');
        $pdf->Ln(10);

        // Table header
        $pdf->SetFillColor(240, 240, 240);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(50, 7, 'Student Name', 1, 0, 'C', true);
        $pdf->Cell(50, 7, 'Batch', 1, 0, 'C', true);
        $pdf->Cell(40, 7, 'Date', 1, 0, 'C', true);
        $pdf->Cell(30, 7, 'Status', 1, 1, 'C', true);

        // Table data
        $pdf->SetFont('helvetica', '', 10);
        foreach ($data as $row) {
            $date = date('Y-m-d', strtotime($row['session_date']));
            $pdf->Cell(50, 6, $row['student_name'], 1);
            $pdf->Cell(50, 6, $row['batch_name'], 1);
            $pdf->Cell(40, 6, $date, 1);
            $pdf->Cell(30, 6, ucfirst($row['status']), 1);
            $pdf->Ln();
        }

        // Direct output to browser
        $pdf->Output('attendance_report.pdf', 'I');
    } catch (Exception $e) {
        throw new Exception('PDF Generation failed: ' . $e->getMessage());
    }
}

function generateCSVReport($data) {
    try {
        $output = fopen('php://output', 'w');
        
        // Add UTF-8 BOM
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        // Add headers
        fputcsv($output, ['Student Name', 'Batch', 'Date', 'Status', 'Notes']);
        
        // Add data
        foreach ($data as $row) {
            fputcsv($output, [
                $row['student_name'],
                $row['batch_name'],
                date('Y-m-d', strtotime($row['session_date'])),
                $row['status'],
                $row['notes'] ?? ''
            ]);
        }
        
        fclose($output);
    } catch (Exception $e) {
        throw new Exception('CSV Generation failed: ' . $e->getMessage());
    }
}
?>
