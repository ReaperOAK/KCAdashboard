<?php
// Add CORS headers
header('Access-Control-Allow-Origin: https://dashboard.kolkatachessacademy.in');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../middleware/auth.php';
require_once '../../config/Database.php';
require_once '../../vendor/autoload.php';

use TCPDF as TCPDF;

try {
    // Validate token before any output
    $user_id = validateToken();
    
    if (!$user_id) {
        throw new Exception('Authentication required');
    }

    // Clean any existing output
    if (ob_get_length()) ob_clean();

    $database = new Database();
    $db = $database->getConnection();

    // Get parameters
    $batch_id = $_GET['batch_id'] ?? 'all';
    $start_date = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
    $end_date = $_GET['end_date'] ?? date('Y-m-d');
    $format = $_GET['format'] ?? 'pdf';

    // Fetch data
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

    // Generate appropriate format
    if ($format === 'pdf') {
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="attendance_report.pdf"');
        
        // Generate PDF
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->SetCreator('KCA Dashboard');
        $pdf->SetAuthor('KCA Admin');
        $pdf->SetTitle('Attendance Report');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(15, 15, 15);
        $pdf->AddPage();

        // Add content to PDF
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 10, 'Attendance Report', 0, 1, 'C');
        $pdf->SetFont('helvetica', '', 12);
        $pdf->Cell(0, 10, "Period: $start_date to $end_date", 0, 1, 'C');
        $pdf->Ln(10);

        // Add table
        $pdf->SetFillColor(240, 240, 240);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(50, 7, 'Student Name', 1, 0, 'C', true);
        $pdf->Cell(50, 7, 'Batch', 1, 0, 'C', true);
        $pdf->Cell(40, 7, 'Date', 1, 0, 'C', true);
        $pdf->Cell(30, 7, 'Status', 1, 1, 'C', true);

        $pdf->SetFont('helvetica', '', 10);
        foreach ($results as $row) {
            $pdf->Cell(50, 6, $row['student_name'], 1);
            $pdf->Cell(50, 6, $row['batch_name'], 1);
            $pdf->Cell(40, 6, date('Y-m-d', strtotime($row['session_date'])), 1);
            $pdf->Cell(30, 6, ucfirst($row['status']), 1);
            $pdf->Ln();
        }

        $pdf->Output('attendance_report.pdf', 'D');
        exit;

    } else if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="attendance_report.csv"');
        
        $output = fopen('php://output', 'w');
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF)); // Add UTF-8 BOM
        
        // Add headers
        fputcsv($output, ['Student Name', 'Batch', 'Date', 'Status', 'Notes']);
        
        // Add data
        foreach ($results as $row) {
            fputcsv($output, [
                $row['student_name'],
                $row['batch_name'],
                date('Y-m-d', strtotime($row['session_date'])),
                $row['status'],
                $row['notes'] ?? ''
            ]);
        }
        
        fclose($output);
        exit;
    }

} catch (Exception $e) {
    // Clear any output
    if (ob_get_length()) ob_clean();
    
    header('Content-Type: application/json');
    http_response_code(401);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
    exit;
}
?>
