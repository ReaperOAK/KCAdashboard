<?php
// Include database and CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../../config/Database.php';
require_once '../../utils/authorize.php';
require_once '../../vendor/autoload.php'; // Make sure you have PhpSpreadsheet installed via composer

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

try {
    // Only process POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit;
    }

    // Authorize request (only teachers and admins can access)
    $user = authorize(['teacher', 'admin']);
    
    // Get JSON data from request body
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['type'])) {
        throw new Exception("Export type is required");
    }
    
    $type = $data['type'];
    $filters = $data['filters'] ?? [];
    $teacher_id = $user['id'];
    
    // Create DB connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Create a new spreadsheet
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    
    switch($type) {
        case 'attendance':
            exportAttendance($db, $sheet, $teacher_id, $filters);
            $filename = 'attendance_report_' . date('Y-m-d') . '.xlsx';
            break;
            
        case 'student_performance':
            exportStudentPerformance($db, $sheet, $teacher_id, $filters);
            $filename = 'student_performance_' . date('Y-m-d') . '.xlsx';
            break;
            
        case 'quiz_results':
            exportQuizResults($db, $sheet, $teacher_id, $filters);
            $filename = 'quiz_results_' . date('Y-m-d') . '.xlsx';
            break;
            
        case 'batch_comparison':
            exportBatchComparison($db, $sheet, $teacher_id, $filters);
            $filename = 'batch_comparison_' . date('Y-m-d') . '.xlsx';
            break;
            
        default:
            throw new Exception("Invalid export type");
    }
    
    // Create an XLSX writer
    $writer = new Xlsx($spreadsheet);
    
    // Save to a temporary file
    $temp_file = tempnam(sys_get_temp_dir(), 'export_');
    $writer->save($temp_file);
    
    // Set headers for file download
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($temp_file));
    header('Cache-Control: max-age=0');
    
    // Output the file
    readfile($temp_file);
    unlink($temp_file); // Delete the temporary file
    exit;
    
} catch (Exception $e) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Helper function to export attendance
function exportAttendance($db, $sheet, $teacher_id, $filters) {
    // Set sheet title
    $sheet->setTitle('Attendance Report');
    
    // Set headers
    $sheet->setCellValue('A1', 'Batch');
    $sheet->setCellValue('B1', 'Student Name');
    $sheet->setCellValue('C1', 'Session Date');
    $sheet->setCellValue('D1', 'Session Title');
    $sheet->setCellValue('E1', 'Status');
    $sheet->setCellValue('F1', 'Check-in Time');
    $sheet->setCellValue('G1', 'Check-out Time');
    $sheet->setCellValue('H1', 'Duration (mins)');
    
    // Build query based on filters
    $query = "SELECT 
              b.name as batch_name,
              u.full_name as student_name,
              bs.date_time as session_date,
              bs.title as session_title,
              a.status,
              a.check_in_time,
              a.check_out_time,
              a.online_duration
            FROM 
              attendance a
            INNER JOIN 
              users u ON a.student_id = u.id
            INNER JOIN 
              batch_sessions bs ON a.session_id = bs.id
            INNER JOIN 
              batches b ON a.batch_id = b.id
            WHERE 
              b.teacher_id = :teacher_id";
              
    $params = [':teacher_id' => $teacher_id];
    
    // Apply filters
    if (!empty($filters['batch_id'])) {
        $query .= " AND a.batch_id = :batch_id";
        $params[':batch_id'] = $filters['batch_id'];
    }
    
    if (!empty($filters['start_date'])) {
        $query .= " AND bs.date_time >= :start_date";
        $params[':start_date'] = $filters['start_date'];
    }
    
    if (!empty($filters['end_date'])) {
        $query .= " AND bs.date_time <= :end_date";
        $params[':end_date'] = $filters['end_date'];
    }
    
    if (!empty($filters['status'])) {
        $query .= " AND a.status = :status";
        $params[':status'] = $filters['status'];
    }
    
    $query .= " ORDER BY bs.date_time DESC, b.name, u.full_name";
    
    $stmt = $db->prepare($query);
    foreach($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    // Add data rows
    $row = 2;
    while ($record = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $sheet->setCellValue('A' . $row, $record['batch_name']);
        $sheet->setCellValue('B' . $row, $record['student_name']);
        $sheet->setCellValue('C' . $row, date('Y-m-d', strtotime($record['session_date'])));
        $sheet->setCellValue('D' . $row, $record['session_title']);
        $sheet->setCellValue('E' . $row, ucfirst($record['status']));
        $sheet->setCellValue('F' . $row, $record['check_in_time'] ? date('H:i:s', strtotime($record['check_in_time'])) : '');
        $sheet->setCellValue('G' . $row, $record['check_out_time'] ? date('H:i:s', strtotime($record['check_out_time'])) : '');
        $sheet->setCellValue('H' . $row, $record['online_duration'] ? $record['online_duration'] : '');
        $row++;
    }
    
    // Auto-size columns
    foreach(range('A', 'H') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    
    // Style header row
    $headerStyle = [
        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => '461FA3']]
    ];
    $sheet->getStyle('A1:H1')->applyFromArray($headerStyle);
}

// Helper function to export student performance
function exportStudentPerformance($db, $sheet, $teacher_id, $filters) {
    $sheet->setTitle('Student Performance');
    
    // Set headers
    $sheet->setCellValue('A1', 'Student Name');
    $sheet->setCellValue('B1', 'Batch');
    $sheet->setCellValue('C1', 'Attendance Rate (%)');
    $sheet->setCellValue('D1', 'Avg Quiz Score');
    $sheet->setCellValue('E1', 'Quizzes Taken');
    $sheet->setCellValue('F1', 'Last Feedback Rating');
    $sheet->setCellValue('G1', 'Last Activity Date');
    
    // Build query
    $query = "SELECT 
              u.full_name as student_name,
              b.name as batch_name,
              b.id as batch_id,
              u.id as student_id
            FROM 
              batch_students bs
            INNER JOIN 
              users u ON bs.student_id = u.id
            INNER JOIN 
              batches b ON bs.batch_id = b.id
            WHERE 
              b.teacher_id = :teacher_id";
              
    $params = [':teacher_id' => $teacher_id];
    
    if (!empty($filters['batch_id'])) {
        $query .= " AND bs.batch_id = :batch_id";
        $params[':batch_id'] = $filters['batch_id'];
    }
    
    $query .= " ORDER BY b.name, u.full_name";
    
    $stmt = $db->prepare($query);
    foreach($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    // Add data rows
    $row = 2;
    while ($record = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $student_id = $record['student_id'];
        $batch_id = $record['batch_id'];
        
        // Get attendance rate
        $attendance_query = "SELECT 
                            COUNT(*) as total_sessions,
                            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count
                           FROM 
                            attendance a
                           INNER JOIN 
                            batch_sessions bs ON a.session_id = bs.id
                           WHERE 
                            a.student_id = :student_id
                            AND a.batch_id = :batch_id";
        $att_stmt = $db->prepare($attendance_query);
        $att_stmt->bindParam(':student_id', $student_id);
        $att_stmt->bindParam(':batch_id', $batch_id);
        $att_stmt->execute();
        $att_data = $att_stmt->fetch(PDO::FETCH_ASSOC);
        
        $attendance_rate = 0;
        if ($att_data && $att_data['total_sessions'] > 0) {
            $attendance_rate = round(($att_data['present_count'] / $att_data['total_sessions']) * 100, 1);
        }
        
        // Get quiz performance
        $quiz_query = "SELECT 
                      AVG(qa.score) as avg_score,
                      COUNT(*) as quiz_count
                     FROM 
                      quiz_attempts qa
                     WHERE 
                      qa.user_id = :student_id";
        $quiz_stmt = $db->prepare($quiz_query);
        $quiz_stmt->bindParam(':student_id', $student_id);
        $quiz_stmt->execute();
        $quiz_data = $quiz_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get last feedback
        $feedback_query = "SELECT 
                          rating,
                          created_at
                         FROM 
                          student_feedback
                         WHERE 
                          student_id = :student_id
                          AND teacher_id = :teacher_id
                         ORDER BY 
                          created_at DESC
                         LIMIT 1";
        $feedback_stmt = $db->prepare($feedback_query);
        $feedback_stmt->bindParam(':student_id', $student_id);
        $feedback_stmt->bindParam(':teacher_id', $teacher_id);
        $feedback_stmt->execute();
        $feedback_data = $feedback_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get last activity
        $activity_query = "SELECT 
                          MAX(created_at) as last_activity
                         FROM 
                          (SELECT MAX(created_at) as created_at
                           FROM attendance
                           WHERE student_id = :student_id
                           UNION ALL
                           SELECT MAX(completed_at) as created_at
                           FROM quiz_attempts
                           WHERE user_id = :student_id) as activities";
        $activity_stmt = $db->prepare($activity_query);
        $activity_stmt->bindParam(':student_id', $student_id);
        $activity_stmt->execute();
        $activity_data = $activity_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Add record to sheet
        $sheet->setCellValue('A' . $row, $record['student_name']);
        $sheet->setCellValue('B' . $row, $record['batch_name']);
        $sheet->setCellValue('C' . $row, $attendance_rate);
        $sheet->setCellValue('D' . $row, round($quiz_data['avg_score'] ?? 0, 1));
        $sheet->setCellValue('E' . $row, $quiz_data['quiz_count'] ?? 0);
        $sheet->setCellValue('F' . $row, $feedback_data ? $feedback_data['rating'] : 'N/A');
        $sheet->setCellValue('G' . $row, $activity_data['last_activity'] ? date('Y-m-d', strtotime($activity_data['last_activity'])) : 'N/A');
        
        $row++;
    }
    
    // Auto-size columns
    foreach(range('A', 'G') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    
    // Style header row
    $headerStyle = [
        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => '461FA3']]
    ];
    $sheet->getStyle('A1:G1')->applyFromArray($headerStyle);
}

// Helper function to export quiz results
function exportQuizResults($db, $sheet, $teacher_id, $filters) {
    $sheet->setTitle('Quiz Results');
    
    // Set headers
    $sheet->setCellValue('A1', 'Quiz Title');
    $sheet->setCellValue('B1', 'Student Name');
    $sheet->setCellValue('C1', 'Score (%)');
    $sheet->setCellValue('D1', 'Time Taken (mins)');
    $sheet->setCellValue('E1', 'Completion Date');
    $sheet->setCellValue('F1', 'Difficulty');
    
    // Build query
    $query = "SELECT 
              q.title as quiz_title,
              u.full_name as student_name,
              qa.score,
              qa.time_taken,
              qa.completed_at,
              q.difficulty
            FROM 
              quiz_attempts qa
            INNER JOIN 
              quizzes q ON qa.quiz_id = q.id
            INNER JOIN 
              users u ON qa.user_id = u.id
            WHERE 
              q.created_by = :teacher_id";
    
    $params = [':teacher_id' => $teacher_id];
    
    // Apply filters
    if (!empty($filters['quiz_id'])) {
        $query .= " AND qa.quiz_id = :quiz_id";
        $params[':quiz_id'] = $filters['quiz_id'];
    }
    
    if (!empty($filters['batch_id'])) {
        $query .= " AND qa.user_id IN (SELECT student_id FROM batch_students WHERE batch_id = :batch_id)";
        $params[':batch_id'] = $filters['batch_id'];
    }
    
    if (!empty($filters['start_date'])) {
        $query .= " AND qa.completed_at >= :start_date";
        $params[':start_date'] = $filters['start_date'];
    }
    
    if (!empty($filters['end_date'])) {
        $query .= " AND qa.completed_at <= :end_date";
        $params[':end_date'] = $filters['end_date'];
    }
    
    $query .= " ORDER BY qa.completed_at DESC";
    
    $stmt = $db->prepare($query);
    foreach($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    // Add data rows
    $row = 2;
    while ($record = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $sheet->setCellValue('A' . $row, $record['quiz_title']);
        $sheet->setCellValue('B' . $row, $record['student_name']);
        $sheet->setCellValue('C' . $row, $record['score']);
        $sheet->setCellValue('D' . $row, $record['time_taken'] ? round($record['time_taken'] / 60, 1) : 'N/A');
        $sheet->setCellValue('E' . $row, date('Y-m-d H:i', strtotime($record['completed_at'])));
        $sheet->setCellValue('F' . $row, ucfirst($record['difficulty']));
        $row++;
    }
    
    // Auto-size columns
    foreach(range('A', 'F') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    
    // Style header row
    $headerStyle = [
        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => '461FA3']]
    ];
    $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);
}

// Helper function to export batch comparison
function exportBatchComparison($db, $sheet, $teacher_id, $filters) {
    $sheet->setTitle('Batch Comparison');
    
    // Set headers
    $sheet->setCellValue('A1', 'Batch Name');
    $sheet->setCellValue('B1', 'Students');
    $sheet->setCellValue('C1', 'Avg Attendance Rate (%)');
    $sheet->setCellValue('D1', 'Avg Quiz Score (%)');
    $sheet->setCellValue('E1', 'Most Missed Sessions');
    $sheet->setCellValue('F1', 'Completion Rate (%)');
    
    // Get batches
    $batch_query = "SELECT 
                    id,
                    name
                   FROM 
                    batches
                   WHERE 
                    teacher_id = :teacher_id";
    
    if (!empty($filters['batch_ids'])) {
        $placeholders = implode(',', array_fill(0, count($filters['batch_ids']), '?'));
        $batch_query .= " AND id IN ($placeholders)";
    }
    
    $batch_stmt = $db->prepare($batch_query);
    $batch_stmt->bindParam(1, $teacher_id);
    
    if (!empty($filters['batch_ids'])) {
        $i = 2;
        foreach ($filters['batch_ids'] as $batch_id) {
            $batch_stmt->bindParam($i, $batch_id);
            $i++;
        }
    }
    
    $batch_stmt->execute();
    
    // Add data rows
    $row = 2;
    while ($batch = $batch_stmt->fetch(PDO::FETCH_ASSOC)) {
        $batch_id = $batch['id'];
        
        // Get student count
        $student_query = "SELECT COUNT(*) as count FROM batch_students WHERE batch_id = :batch_id";
        $student_stmt = $db->prepare($student_query);
        $student_stmt->bindParam(':batch_id', $batch_id);
        $student_stmt->execute();
        $student_count = $student_stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        // Get attendance rate
        $attendance_query = "SELECT 
                            COUNT(*) as total_records,
                            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count
                           FROM 
                            attendance a
                           WHERE 
                            a.batch_id = :batch_id";
        $att_stmt = $db->prepare($attendance_query);
        $att_stmt->bindParam(':batch_id', $batch_id);
        $att_stmt->execute();
        $att_data = $att_stmt->fetch(PDO::FETCH_ASSOC);
        
        $attendance_rate = 0;
        if ($att_data && $att_data['total_records'] > 0) {
            $attendance_rate = round(($att_data['present_count'] / $att_data['total_records']) * 100, 1);
        }
        
        // Get quiz scores
        $quiz_query = "SELECT 
                      AVG(qa.score) as avg_score
                     FROM 
                      quiz_attempts qa
                     INNER JOIN
                      batch_students bs ON qa.user_id = bs.student_id
                     WHERE 
                      bs.batch_id = :batch_id";
        $quiz_stmt = $db->prepare($quiz_query);
        $quiz_stmt->bindParam(':batch_id', $batch_id);
        $quiz_stmt->execute();
        $avg_score = $quiz_stmt->fetch(PDO::FETCH_ASSOC)['avg_score'] ?? 0;
        
        // Get most missed sessions
        $missed_query = "SELECT 
                        bs.title,
                        COUNT(*) as missed_count
                       FROM 
                        attendance a
                       INNER JOIN
                        batch_sessions bs ON a.session_id = bs.id
                       WHERE 
                        a.batch_id = :batch_id
                        AND a.status = 'absent'
                       GROUP BY 
                        a.session_id
                       ORDER BY 
                        missed_count DESC
                       LIMIT 1";
        $missed_stmt = $db->prepare($missed_query);
        $missed_stmt->bindParam(':batch_id', $batch_id);
        $missed_stmt->execute();
        $missed_data = $missed_stmt->fetch(PDO::FETCH_ASSOC);
        $most_missed = $missed_data ? $missed_data['title'] . ' (' . $missed_data['missed_count'] . ')' : 'N/A';
        
        // Get completion rate (students who completed all modules/sessions)
        $completion_query = "SELECT 
                            COUNT(DISTINCT bs.student_id) as completed_students
                           FROM 
                            batch_students bs
                           WHERE 
                            bs.batch_id = :batch_id
                            AND bs.status = 'completed'";
        $completion_stmt = $db->prepare($completion_query);
        $completion_stmt->bindParam(':batch_id', $batch_id);
        $completion_stmt->execute();
        $completed_students = $completion_stmt->fetch(PDO::FETCH_ASSOC)['completed_students'] ?? 0;
        
        $completion_rate = 0;
        if ($student_count > 0) {
            $completion_rate = round(($completed_students / $student_count) * 100, 1);
        }
        
        // Add record to sheet
        $sheet->setCellValue('A' . $row, $batch['name']);
        $sheet->setCellValue('B' . $row, $student_count);
        $sheet->setCellValue('C' . $row, $attendance_rate);
        $sheet->setCellValue('D' . $row, round($avg_score, 1));
        $sheet->setCellValue('E' . $row, $most_missed);
        $sheet->setCellValue('F' . $row, $completion_rate);
        
        $row++;
    }
    
    // Auto-size columns
    foreach(range('A', 'F') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    
    // Style header row
    $headerStyle = [
        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['rgb' => '461FA3']]
    ];
    $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);
}
?>