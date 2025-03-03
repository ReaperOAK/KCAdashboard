<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define the missing DEBUG_MODE constant
define('DEBUG_MODE', false); // Set to true only in development environment

// Include database and CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include required files
require_once '../../config/Database.php';
require_once '../../utils/authorize.php';
require_once '../../vendor/autoload.php'; // This should point to where composer installed dependencies

// Include export functions
require_once 'exports/attendance.php';
require_once 'exports/student_performance.php';
require_once 'exports/quiz_results.php';
require_once 'exports/batch_comparison.php';

// TCPDF library class
use TCPDF;

try {
    // Only process POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    // Get JSON data from request body
    $input = file_get_contents("php://input");
    if (empty($input)) {
        throw new Exception("No input data provided");
    }

    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON: " . json_last_error_msg());
    }
    
    if (!isset($data['type'])) {
        throw new Exception("Export type is required");
    }
    
    $type = $data['type'];
    $filters = $data['filters'] ?? [];
    
    // Authorize request (only teachers and admins can access)
    try {
        $user = authorize(['teacher', 'admin']);
        $teacher_id = $user['id'];
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authorization failed: ' . $e->getMessage()]);
        exit;
    }
    
    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();

    // Create new PDF document
    $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8', false);
    
    // Set document information
    $pdf->SetCreator('Kolkata Chess Academy Dashboard');
    $pdf->SetAuthor('Kolkata Chess Academy');
    $pdf->SetTitle(ucfirst($type) . ' Report');
    $pdf->SetSubject('KCA Analytics Report');
    $pdf->SetKeywords('Chess, Academy, Report, Analytics');
    
    // Set default header data
    $pdf->setHeaderData('', 0, 'Kolkata Chess Academy', ucfirst($type) . ' Report - ' . date('Y-m-d'));
    
    // Set header and footer fonts
    $pdf->setHeaderFont(Array('helvetica', '', 10));
    $pdf->setFooterFont(Array('helvetica', '', 8));
    
    // Set default monospaced font
    $pdf->SetDefaultMonospacedFont('courier');
    
    // Set margins
    $pdf->SetMargins(15, 15, 15);
    $pdf->SetHeaderMargin(5);
    $pdf->SetFooterMargin(10);
    
    // Set auto page breaks
    $pdf->SetAutoPageBreak(TRUE, 15);
    
    // Set image scale factor
    $pdf->setImageScale(1.25);
    
    // Set default font
    $pdf->SetFont('helvetica', '', 10);
    
    // Add a page
    $pdf->AddPage();
    
    // Log the export type
    error_log("Exporting PDF report of type: $type with filters: " . json_encode($filters));
    
    switch($type) {
        case 'attendance':
            exportAttendance($db, $pdf, $teacher_id, $filters);
            $filename = 'attendance_report_' . date('Y-m-d') . '.pdf';
            break;
            
        case 'student_performance':
            exportStudentPerformance($db, $pdf, $teacher_id, $filters);
            $filename = 'student_performance_' . date('Y-m-d') . '.pdf';
            break;
            
        case 'quiz_results':
            exportQuizResults($db, $pdf, $teacher_id, $filters);
            $filename = 'quiz_results_' . date('Y-m-d') . '.pdf';
            break;
            
        case 'batch_comparison':
            exportBatchComparison($db, $pdf, $teacher_id, $filters);
            $filename = 'batch_comparison_' . date('Y-m-d') . '.pdf';
            break;
            
        default:
            throw new Exception("Invalid export type: $type");
    }
    
    // Clear any previous output
    if (ob_get_level()) ob_end_clean();
    
    // Set headers for file download
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: max-age=0');
    
    // Output the PDF
    $pdf->Output($filename, 'D');
    exit;
    
} catch (Exception $e) {
    error_log("Export error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    
    // Clear any previous output
    if (ob_get_level()) ob_end_clean();
    
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'trace' => DEBUG_MODE ? $e->getTraceAsString() : null
    ]);
}
?>