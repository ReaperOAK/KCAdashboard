<?php
// Helper function to export student performance to PDF
function exportStudentPerformance($db, $pdf, $teacher_id, $filters) {
    // Add a title
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 10, 'Student Performance Report', 0, 1, 'C');
    
    // Add filter information
    $pdf->SetFont('helvetica', 'I', 9);
    $filterText = 'Filters: ';
    if (!empty($filters['batch_id'])) {
        $stmt = $db->prepare("SELECT name FROM batches WHERE id = ?");
        $stmt->execute([$filters['batch_id']]);
        $batchName = $stmt->fetchColumn() ?: 'Unknown';
        $filterText .= "Batch: " . $batchName . ", ";
    }
    $filterText = rtrim($filterText, ", ");
    $pdf->Cell(0, 5, $filterText, 0, 1, 'C');
    $pdf->Ln(5);
    
    // Set font for the table header
    $pdf->SetFont('helvetica', 'B', 10);
    
    // Define column widths
    $colWidth = [50, 45, 30, 30, 30, 35, 50]; // Width for each column
    
    // Table header
    $pdf->SetFillColor(70, 31, 163); // Purple background for header
    $pdf->SetTextColor(255, 255, 255); // White text for header
    $pdf->Cell($colWidth[0], 10, 'Student Name', 1, 0, 'C', true);
    $pdf->Cell($colWidth[1], 10, 'Batch', 1, 0, 'C', true);
    $pdf->Cell($colWidth[2], 10, 'Attendance Rate (%)', 1, 0, 'C', true);
    $pdf->Cell($colWidth[3], 10, 'Avg Quiz Score', 1, 0, 'C', true);
    $pdf->Cell($colWidth[4], 10, 'Quizzes Taken', 1, 0, 'C', true);
    $pdf->Cell($colWidth[5], 10, 'Last Feedback', 1, 0, 'C', true);
    $pdf->Cell($colWidth[6], 10, 'Last Activity Date', 1, 1, 'C', true);
    
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
    
    // Reset text color for data
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetFont('helvetica', '', 9);
    
    // Add data rows
    $recordCount = $stmt->rowCount();
    if ($recordCount == 0) {
        $pdf->SetFont('helvetica', 'I', 10);
        $pdf->Cell(array_sum($colWidth), 10, 'No student records found matching your criteria.', 1, 1, 'C');
    } else {
        $fill = false; // To alternate row colors
        
        while ($record = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $student_id = $record['student_id'];
            $batch_id = $record['batch_id'];
            
            // Set background color for alternating rows
            $fill = !$fill;
            if ($fill) {
                $pdf->SetFillColor(240, 240, 250); // Light purple for alternate rows
            } else {
                $pdf->SetFillColor(255, 255, 255); // White for regular rows
            }
            
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
            $avg_score = round($quiz_data['avg_score'] ?? 0, 1);
            $quiz_count = $quiz_data['quiz_count'] ?? 0;
            
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
            $feedback = $feedback_data ? $feedback_data['rating'] : 'N/A';
            
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
            $last_activity = $activity_data['last_activity'] ? date('Y-m-d', strtotime($activity_data['last_activity'])) : 'N/A';
            
            // Save current position
            $startY = $pdf->GetY();
            $startX = $pdf->GetX();
            
            // Check if we need a page break
            if ($pdf->GetY() > $pdf->getPageHeight() - 20) {
                $pdf->AddPage();
                $startY = $pdf->GetY();
            }
            
            // Draw cells
            $lineHeight = 6; // Height for each cell
            
            // Student name
            $pdf->MultiCell($colWidth[0], $lineHeight, $record['student_name'], 1, 'L', $fill, 0, $startX, $startY);
            $currX = $startX + $colWidth[0];
            
            // Batch name
            $pdf->MultiCell($colWidth[1], $lineHeight, $record['batch_name'], 1, 'L', $fill, 0, $currX, $startY);
            $currX += $colWidth[1];
            
            // Attendance rate
            // Color-code attendance rate
            if ($attendance_rate >= 80) {
                $pdf->SetTextColor(0, 128, 0); // Green
            } elseif ($attendance_rate >= 60) {
                $pdf->SetTextColor(255, 140, 0); // Orange
            } else {
                $pdf->SetTextColor(200, 0, 0); // Red
            }
            $pdf->MultiCell($colWidth[2], $lineHeight, $attendance_rate . '%', 1, 'C', $fill, 0, $currX, $startY);
            $pdf->SetTextColor(0, 0, 0); // Reset text color
            $currX += $colWidth[2];
            
            // Quiz score
            if ($avg_score >= 80) {
                $pdf->SetTextColor(0, 128, 0); // Green
            } elseif ($avg_score >= 60) {
                $pdf->SetTextColor(255, 140, 0); // Orange
            } else {
                $pdf->SetTextColor(200, 0, 0); // Red
            }
            $pdf->MultiCell($colWidth[3], $lineHeight, $avg_score, 1, 'C', $fill, 0, $currX, $startY);
            $pdf->SetTextColor(0, 0, 0); // Reset text color
            $currX += $colWidth[3];
            
            // Quiz count
            $pdf->MultiCell($colWidth[4], $lineHeight, $quiz_count, 1, 'C', $fill, 0, $currX, $startY);
            $currX += $colWidth[4];
            
            // Last feedback
            $pdf->MultiCell($colWidth[5], $lineHeight, $feedback, 1, 'C', $fill, 0, $currX, $startY);
            $currX += $colWidth[5];
            
            // Last activity date
            $pdf->MultiCell($colWidth[6], $lineHeight, $last_activity, 1, 'C', $fill, 0, $currX, $startY);
            
            // Move to next line
            $pdf->SetY($startY + $lineHeight);
        }
    }
    
    // Add summary statistics
    $pdf->Ln(10);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 8, 'Class Performance Summary', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 10);
    
    // Get overall stats
    $stats_query = "SELECT 
                   AVG(att_rate.rate) as avg_attendance,
                   AVG(quiz.score) as avg_quiz_score,
                   COUNT(DISTINCT u.id) as total_students
                  FROM 
                   users u
                  INNER JOIN
                   batch_students bs ON u.id = bs.student_id
                  INNER JOIN
                   batches b ON bs.batch_id = b.id
                  LEFT JOIN (
                    SELECT 
                      a.student_id,
                      a.batch_id,
                      (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100 / COUNT(*)) as rate
                    FROM 
                      attendance a
                    GROUP BY 
                      a.student_id, a.batch_id
                  ) as att_rate ON u.id = att_rate.student_id AND bs.batch_id = att_rate.batch_id
                  LEFT JOIN (
                    SELECT 
                      qa.user_id,
                      AVG(qa.score) as score
                    FROM 
                      quiz_attempts qa
                    GROUP BY 
                      qa.user_id
                  ) as quiz ON u.id = quiz.user_id
                  WHERE 
                   b.teacher_id = :teacher_id";
    
    $params = [':teacher_id' => $teacher_id];
    
    if (!empty($filters['batch_id'])) {
        $stats_query .= " AND bs.batch_id = :batch_id";
        $params[':batch_id'] = $filters['batch_id'];
    }
    
    $stats_stmt = $db->prepare($stats_query);
    foreach($params as $key => $value) {
        $stats_stmt->bindValue($key, $value);
    }
    $stats_stmt->execute();
    $stats_data = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    
    $avg_attendance = round($stats_data['avg_attendance'] ?? 0, 1);
    $avg_quiz_score = round($stats_data['avg_quiz_score'] ?? 0, 1);
    $total_students = $stats_data['total_students'] ?? 0;
    
    // Print summary stats
    $pdf->Cell(50, 8, 'Total Students:', 0, 0, 'L');
    $pdf->Cell(20, 8, $total_students, 0, 1, 'L');
    
    $pdf->Cell(50, 8, 'Average Attendance Rate:', 0, 0, 'L');
    $pdf->Cell(20, 8, $avg_attendance . '%', 0, 1, 'L');
    
    $pdf->Cell(50, 8, 'Average Quiz Score:', 0, 0, 'L');
    $pdf->Cell(20, 8, $avg_quiz_score, 0, 1, 'L');
    
    // Add report generation info
    $pdf->Ln(5);
    $pdf->SetFont('helvetica', 'I', 8);
    $pdf->Cell(0, 5, 'Report generated on: ' . date('Y-m-d H:i:s'), 0, 1, 'R');
}
?>