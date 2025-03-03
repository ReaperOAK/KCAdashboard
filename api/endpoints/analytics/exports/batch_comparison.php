<?php
// Helper function to export batch comparison to PDF
function exportBatchComparison($db, $pdf, $teacher_id, $filters) {
    // Add a title
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 10, 'Batch Comparison Report', 0, 1, 'C');
    
    // Add filter information
    $pdf->SetFont('helvetica', 'I', 9);
    $filterText = 'Filters: ';
    if (!empty($filters['batch_ids'])) {
        $filterText .= "Selected Batches: " . implode(", ", $filters['batch_ids']);
    } else {
        $filterText .= "All Batches";
    }
    $pdf->Cell(0, 5, $filterText, 0, 1, 'C');
    $pdf->Ln(5);
    
    // Set font for the table header
    $pdf->SetFont('helvetica', 'B', 10);
    
    // Define column widths
    $colWidth = [50, 25, 40, 40, 55, 40]; // Width for each column
    
    // Table header
    $pdf->SetFillColor(70, 31, 163); // Purple background for header
    $pdf->SetTextColor(255, 255, 255); // White text for header
    $pdf->Cell($colWidth[0], 10, 'Batch Name', 1, 0, 'C', true);
    $pdf->Cell($colWidth[1], 10, 'Students', 1, 0, 'C', true);
    $pdf->Cell($colWidth[2], 10, 'Avg Attendance Rate (%)', 1, 0, 'C', true);
    $pdf->Cell($colWidth[3], 10, 'Avg Quiz Score (%)', 1, 0, 'C', true);
    $pdf->Cell($colWidth[4], 10, 'Most Missed Session', 1, 0, 'C', true);
    $pdf->Cell($colWidth[5], 10, 'Completion Rate (%)', 1, 1, 'C', true);
    
    // Get batches
    $batch_query = "SELECT 
                    id,
                    name
                   FROM 
                    batches
                   WHERE 
                    teacher_id = :teacher_id";
    
    $params = [':teacher_id' => $teacher_id];
    
    // If specific batch IDs were provided, add them to the query
    if (!empty($filters['batch_ids'])) {
        $batch_ids = $filters['batch_ids'];
        $placeholders = implode(',', array_fill(0, count($batch_ids), '?'));
        $batch_query .= " AND id IN ($placeholders)";
    }
    
    $batch_query .= " ORDER BY name";
    
    $batch_stmt = $db->prepare($batch_query);
    
    // Bind teacher_id
    $batch_stmt->bindValue(1, $teacher_id, PDO::PARAM_INT);
    
    // Bind batch IDs if provided
    if (!empty($filters['batch_ids'])) {
        $i = 2;
        foreach ($filters['batch_ids'] as $batch_id) {
            $batch_stmt->bindValue($i, $batch_id, PDO::PARAM_INT);
            $i++;
        }
    }
    
    $batch_stmt->execute();
    
    // Reset text color for data
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetFont('helvetica', '', 9);
    
    // Add data rows
    $recordCount = $batch_stmt->rowCount();
    if ($recordCount == 0) {
        $pdf->SetFont('helvetica', 'I', 10);
        $pdf->Cell(array_sum($colWidth), 10, 'No batch records found matching your criteria.', 1, 1, 'C');
    } else {
        $fill = false; // To alternate row colors
        $totalStudents = 0;
        $totalAttendanceRate = 0;
        $totalQuizScore = 0;
        $totalCompletionRate = 0;
        $batchCount = 0;
        
        while ($batch = $batch_stmt->fetch(PDO::FETCH_ASSOC)) {
            $batch_id = $batch['id'];
            $batchCount++;
            
            // Set background color for alternating rows
            $fill = !$fill;
            if ($fill) {
                $pdf->SetFillColor(240, 240, 250); // Light purple for alternate rows
            } else {
                $pdf->SetFillColor(255, 255, 255); // White for regular rows
            }
            
            // Get student count
            $student_query = "SELECT COUNT(*) as count FROM batch_students WHERE batch_id = :batch_id";
            $student_stmt = $db->prepare($student_query);
            $student_stmt->bindParam(':batch_id', $batch_id);
            $student_stmt->execute();
            $student_count = $student_stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
            $totalStudents += $student_count;
            
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
            $totalAttendanceRate += $attendance_rate;
            
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
            $avg_score = round($quiz_stmt->fetch(PDO::FETCH_ASSOC)['avg_score'] ?? 0, 1);
            $totalQuizScore += $avg_score;
            
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
                            a.session_id, bs.title
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
            $totalCompletionRate += $completion_rate;
            
            // Check if we need a page break
            if ($pdf->GetY() > $pdf->getPageHeight() - 20) {
                $pdf->AddPage();
            }
            
            // Save current position
            $startY = $pdf->GetY();
            $startX = $pdf->GetX();
            
            // Draw cells - first row
            $lineHeight = 6; // Height for each cell
            
            // Batch name
            $pdf->MultiCell($colWidth[0], $lineHeight, $batch['name'], 1, 'L', $fill, 0, $startX, $startY);
            $currX = $startX + $colWidth[0];
            
            // Student count
            $pdf->MultiCell($colWidth[1], $lineHeight, $student_count, 1, 'C', $fill, 0, $currX, $startY);
            $currX += $colWidth[1];
            
            // Attendance rate
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
            $pdf->MultiCell($colWidth[3], $lineHeight, $avg_score . '%', 1, 'C', $fill, 0, $currX, $startY);
            $pdf->SetTextColor(0, 0, 0); // Reset text color
            $currX += $colWidth[3];
            
            // Most missed session
            $pdf->MultiCell($colWidth[4], $lineHeight, $most_missed, 1, 'L', $fill, 0, $currX, $startY);
            $currX += $colWidth[4];
            
            // Completion rate
            $pdf->MultiCell($colWidth[5], $lineHeight, $completion_rate . '%', 1, 'C', $fill, 0, $currX, $startY);
            
            // Move to next line
            $pdf->SetY($pdf->GetY() + $lineHeight);
        }
        
        // Calculate averages
        $avgAttendanceRate = $batchCount > 0 ? round($totalAttendanceRate / $batchCount, 1) : 0;
        $avgQuizScore = $batchCount > 0 ? round($totalQuizScore / $batchCount, 1) : 0;
        $avgCompletionRate = $batchCount > 0 ? round($totalCompletionRate / $batchCount, 1) : 0;
        
        // Add summary statistics
        $pdf->Ln(10);
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'Batch Comparison Summary', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        
        $pdf->Cell(50, 8, 'Total Batches:', 0, 0, 'L');
        $pdf->Cell(30, 8, $batchCount, 0, 1, 'L');
        
        $pdf->Cell(50, 8, 'Total Students:', 0, 0, 'L');
        $pdf->Cell(30, 8, $totalStudents, 0, 1, 'L');
        
        $pdf->Cell(50, 8, 'Average Attendance Rate:', 0, 0, 'L');
        $pdf->Cell(30, 8, $avgAttendanceRate . '%', 0, 1, 'L');
        
        $pdf->Cell(50, 8, 'Average Quiz Score:', 0, 0, 'L');
        $pdf->Cell(30, 8, $avgQuizScore . '%', 0, 1, 'L');
        
        $pdf->Cell(50, 8, 'Average Completion Rate:', 0, 0, 'L');
        $pdf->Cell(30, 8, $avgCompletionRate . '%', 0, 1, 'L');
    }
    
    // Add report generation info
    $pdf->Ln(5);
    $pdf->SetFont('helvetica', 'I', 8);
    $pdf->Cell(0, 5, 'Report generated on: ' . date('Y-m-d H:i:s'), 0, 1, 'R');
}
?>